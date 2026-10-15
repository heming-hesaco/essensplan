-- Abnahmeprüfung der Zugriffsrechte, gegen eine Wegwerf-Instanz:
--   psql … -v ON_ERROR_STOP=1 -f supabase/tests/haushalt.sql
-- Jede Prüfung wirft bei Abweichung; am Ende steht „ALLE PRÜFUNGEN BESTANDEN“.
begin;

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'anna@test.de'),
  ('22222222-2222-2222-2222-222222222222', 'ben@test.de'),
  ('33333333-3333-3333-3333-333333333333', 'fremd@test.de');

create function pg_temp.als(u uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  select set_config('request.jwt.claim.sub', u::text, true);
  set local role authenticated;
$$;
create function pg_temp.pruefe(bedingung boolean, was text) returns void language plpgsql as $$
begin
  if not bedingung then raise exception 'FEHLGESCHLAGEN: %', was; end if;
  raise notice 'ok: %', was;
end $$;

-- Anna legt einen Haushalt an.
select pg_temp.als('11111111-1111-1111-1111-111111111111');
create temp table t_ids as select public.haushalt_anlegen('Familie') as id;
grant select on t_ids to authenticated;
select pg_temp.pruefe((select count(*) from public.haushalte) = 1, 'Anna sieht ihren Haushalt');
select pg_temp.pruefe((select einladungscode ~ '^[A-HJ-NP-Z2-9]{8}$' from public.haushalte), 'Code hat acht eindeutige Zeichen');
insert into public.rezepte (haushalt_id, id, daten) select id, 'r1', '{"name":"Nudeln"}' from t_ids;
insert into public.haken (haushalt_id, woche, art, schluessel, an) select id, '2026-10-17', 'abgehakt', 'spaghetti|g', true from t_ids;
reset role;

-- Ben tritt mit dem Code bei (klein geschrieben, mit Leerzeichen) und sieht dasselbe.
select pg_temp.als('22222222-2222-2222-2222-222222222222');
select pg_temp.pruefe((select count(*) from public.haushalte) = 0, 'vor dem Beitritt sieht Ben nichts');
reset role;
create temp table t_code as select lower(substr(einladungscode, 1, 4) || ' ' || substr(einladungscode, 5)) as c from public.haushalte;
grant select on t_code to authenticated;
select pg_temp.als('22222222-2222-2222-2222-222222222222');
select pg_temp.pruefe(public.haushalt_beitreten((select c from t_code)) = (select id from t_ids), 'Beitritt mit Code');
select pg_temp.pruefe((select count(*) from public.rezepte) = 1, 'Ben sieht Annas Rezept');
update public.haken set an = false where schluessel = 'spaghetti|g';
select pg_temp.pruefe((select count(*) from public.mitglieder) = 2, 'zwei Mitglieder');
reset role;

-- Ein fremdes Konto sieht und ändert nichts.
select pg_temp.als('33333333-3333-3333-3333-333333333333');
select pg_temp.pruefe((select count(*) from public.rezepte) = 0, 'Fremder liest keine Rezepte');
select pg_temp.pruefe((select count(*) from public.haken) = 0, 'Fremder liest keine Haken');
select pg_temp.pruefe((select count(*) from public.mitglieder) = 0, 'Fremder liest keine Mitglieder');
update public.rezepte set daten = '{"name":"gehackt"}';
do $$ begin
  insert into public.rezepte (haushalt_id, id, daten) select id, 'boese', '{}' from t_ids;
  raise exception 'FEHLGESCHLAGEN: Fremder konnte schreiben';
exception when insufficient_privilege then raise notice 'ok: Fremder kann nicht schreiben';
end $$;
do $$ begin
  perform public.haushalt_beitreten('FALSCH12');
  raise exception 'FEHLGESCHLAGEN: falscher Code angenommen';
exception when raise_exception then
  if sqlerrm like 'FEHLGESCHLAGEN%' then raise; end if;
  raise notice 'ok: falscher Code abgewiesen (%)', sqlerrm;
end $$;
reset role;
select pg_temp.pruefe((select daten->>'name' from public.rezepte where id = 'r1') = 'Nudeln', 'Fremdes Update blieb wirkungslos');
select pg_temp.pruefe((select an from public.haken) = false, 'Bens Haken ist gespeichert');

-- Einladungscode lässt sich nicht umschreiben, auch nicht von Mitgliedern.
select pg_temp.als('11111111-1111-1111-1111-111111111111');
do $$ begin
  update public.haushalte set einladungscode = 'AAAAAAAA';
  raise exception 'FEHLGESCHLAGEN: Code änderbar';
exception when insufficient_privilege then raise notice 'ok: Code nicht änderbar';
end $$;
update public.haushalte set name = 'Familie H.', einstellungen = '{"portionen":3}';
select pg_temp.pruefe((select name from public.haushalte) = 'Familie H.', 'Name und Einstellungen änderbar');
-- Zweiter Haushalt für dasselbe Konto geht nicht.
do $$ begin
  perform public.haushalt_anlegen('Zweiter');
  raise exception 'FEHLGESCHLAGEN: zweiter Haushalt';
exception when raise_exception then
  if sqlerrm like 'FEHLGESCHLAGEN%' then raise; end if;
  raise notice 'ok: nur ein Haushalt je Konto';
end $$;
reset role;

-- Anon darf gar nichts.
set local role anon;
do $$ begin
  perform 1 from public.rezepte;
  raise exception 'FEHLGESCHLAGEN: anon liest';
exception when insufficient_privilege then raise notice 'ok: anon liest nicht';
end $$;
do $$ begin
  perform public.haushalt_anlegen('x');
  raise exception 'FEHLGESCHLAGEN: anon legt an';
exception when insufficient_privilege then raise notice 'ok: anon legt keinen Haushalt an';
end $$;
reset role;

-- Verlassen: erst Ben, dann Anna – mit dem letzten Mitglied verschwindet der Haushalt.
select pg_temp.als('22222222-2222-2222-2222-222222222222');
select public.haushalt_verlassen();
select pg_temp.pruefe((select count(*) from public.rezepte) = 0, 'Ben sieht nach dem Verlassen nichts mehr');
reset role;
select pg_temp.pruefe((select count(*) from public.haushalte) = 1, 'Haushalt bleibt, solange Anna drin ist');
select pg_temp.als('11111111-1111-1111-1111-111111111111');
select public.haushalt_verlassen();
reset role;
select pg_temp.pruefe((select count(*) from public.haushalte) = 0, 'letzter geht: Haushalt gelöscht');
select pg_temp.pruefe((select count(*) from public.rezepte) = 0, 'mit ihm die Rezepte');

select 'ALLE PRÜFUNGEN BESTANDEN';
rollback;
