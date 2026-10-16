-- Wünsche des Kindes: eine Zeile je Gericht. Zurückgenommen wird mit an = false statt
-- mit einer Löschung (siehe Kopf der ersten Migration: Realtime meldet Updates nur an
-- den Haushalt, Löschungen an alle).
create table public.wuensche (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  rezept_id text not null check (char_length(rezept_id) <= 100),
  an boolean not null,
  seit date not null,
  aktualisiert_am timestamptz not null default now(),
  primary key (haushalt_id, rezept_id)
);

create trigger aktualisiert before update on public.wuensche
  for each row execute function privat.setze_aktualisiert();

alter table public.wuensche enable row level security;
create policy wuensche_haushalt on public.wuensche for all to authenticated
  using (privat.ist_mitglied(haushalt_id)) with check (privat.ist_mitglied(haushalt_id));
revoke all on public.wuensche from anon;

alter publication supabase_realtime add table public.wuensche;
