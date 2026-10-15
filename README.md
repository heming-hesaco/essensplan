# Essensplan

Ein Wochenplan fürs Essen für zwei Erwachsene und ein Kind – mit dem Ziel, **einmal in der
Woche** einzukaufen: Samstag Wochenmarkt (Obst, Gemüse, Brot, Käse, Eier), danach Aldi
(Grundlebensmittel), Edeka nur für Besonderes.

## Was die erste Stufe kann

**Wochenplan (Samstag bis Freitag).** Ein Knopf schlägt sieben Abendessen vor, nach einem
Wochenraster, das ihr in den Einstellungen ändern könnt:

| Sa | So | Mo | Di | Mi | Do | Fr |
|---|---|---|---|---|---|---|
| Gemüse (Markttag) | Etwas Besonderes | Nudeln | Hülsenfrüchte | Fisch | Ofen & Blech | Wunsch des Kindes |

Der Vorschlag
- nimmt bevorzugt **Saisonware** (Saisonkalender für Deutschland im Zutatenkatalog),
- verteilt frische Zutaten auf **mehrere Gerichte** (der halbe Kürbis vom Samstag landet am
  Donnerstag auf dem Blech),
- legt **Empfindliches an den Wochenanfang** (frisches Fleisch, Brokkoli, Salat),
- wiederholt keine Gerichte der **letzten zwei Wochen**, wenn es Alternativen gibt.

Jeder Tag lässt sich **tauschen**, **selbst wählen**, **anheften** (bleibt beim
Neu-Vorschlagen stehen) oder zum **Restetag** machen. „Mehr kochen für Mittag morgen“ plant
die Reste fürs Mittagessen gleich mit ein. Unten zeigt die Woche, wie viel vegetarisch, mit
Fisch und mit Fleisch ist, und welche Zutaten mehrfach verwendet werden.

**Frühstück** ist ein Baukasten: feste Wochenmengen (Haferflocken, Brot, Käse, Obst …),
keine Rezepte.

**Einkaufsliste.** Alles zusammengezählt, auf euren Haushalt umgerechnet (2,5 Portionen je
Abendessen, +2 mit Resten) und auf kaufbare Mengen gerundet – getrennt nach **Wochenmarkt,
Aldi und Edeka**, innerhalb des Ladens nach Stand bzw. Gang. Abhaken, Erledigtes rutscht nach
unten, „Teilen“ schickt die Liste eines Ladens per WhatsApp oder Nachricht. Grundvorrat (Öl,
Gewürze, Mehl) steht nur unter „Vorrat prüfen“ und kommt erst auf die Liste, wenn er leer ist.
Eigene Posten (Spülmittel …) lassen sich je Laden ergänzen.

**Rezepte.** 33 Startrezepte, davon 9 Nudelgerichte – dazu Thunfisch-Nudeln,
Linsen-Bolognese, Lasagne und Minestrone in anderen Kategorien. Eigene Rezepte anlegen,
ändern, kopieren, löschen. Für eine neue Zutat fragt das Formular, in welchem Laden ihr sie
kauft. Unter Einstellungen lässt sich für jede Zutat der Laden ändern.

## Gemeinsamer Stand auf beiden Handys

Unter **Einstellungen → Gemeinsam nutzen** legt jeder ein Konto an (E-Mail und Passwort).
Der Erste legt einen **Haushalt** an – sein bisheriger Stand wird der Anfang – und gibt den
**Einladungscode** (acht Zeichen) weiter. Der Zweite tritt damit bei; sein Stand wird durch
den des Haushalts ersetzt. Danach erscheint jede Änderung sofort auf dem anderen Handy.

Wie das gebaut ist:

- **Ein Haken ist eine eigene Zeile.** Wer am Markt abhakt und wer gleichzeitig bei Aldi
  abhakt, überschreibt sich nicht. Pläne, Rezepte und Einstellungen sind je Woche bzw. je
  Rezept eine Zeile; dort gewinnt die spätere Änderung.
- **Ohne Netz geht nichts verloren.** Jede Änderung kommt zuerst in eine Warteschlange im
  Gerätespeicher und wird nachgeschickt, sobald das Netz wieder da ist – auch nach einem
  Schließen der App. Oben steht dann „Kein Netz“.
- **Gelöscht wird nicht, sondern markiert** (`geloescht`, `an = false`). Realtime liefert
  Löschungen ohne Zeilenrechte an alle aus, Updates nur an die Mitglieder des Haushalts.
- **Zugriff entscheidet die Datenbank** (Row Level Security): Jedes Konto sieht nur den
  eigenen Haushalt. Haushalte entstehen und werden betreten nur über die Funktionen
  `haushalt_anlegen`, `haushalt_beitreten`, `haushalt_verlassen`. Wer als Letzter geht,
  löscht den Haushalt mit allen gemeinsamen Daten. Prüfung: `supabase/tests/haushalt.sql`.
- Ohne `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` läuft die App wie vorher nur auf
  dem Gerät.

Einrichten: Supabase-Projekt anlegen, `supabase/migrations/*.sql` einspielen, die beiden
Werte aus `.env.example` setzen (lokal in `.env`, beim Hosting als Umgebungsvariablen). In
Supabase unter Authentication → URL Configuration die Adresse der App als Site URL eintragen,
damit der Bestätigungslink nach der Registrierung dorthin führt.

Die Datenbankprüfung läuft gegen eine Wegwerf-Datenbank, nie gegen das echte Projekt:

```bash
docker run -d --name pg-test -e POSTGRES_PASSWORD=postgres -p 54329:5432 public.ecr.aws/supabase/postgres:17.6.1.010
export PGPASSWORD=postgres
psql -h localhost -p 54329 -U postgres -d postgres -f supabase/migrations/20261015190000_gemeinsamer_haushalt.sql
psql -h localhost -p 54329 -U postgres -d postgres -v ON_ERROR_STOP=1 -f supabase/tests/haushalt.sql
```

## Benutzen

```bash
npm install
npm run dev        # Entwicklung: http://localhost:5173
npm test           # Prüfungen der Planungs- und Einkaufslogik
npm run build      # fertige Dateien in dist/
```

Die App ist eine PWA: im Handy-Browser öffnen und „Zum Startbildschirm hinzufügen“. Danach
startet sie wie eine App, und die Einkaufsliste funktioniert auch ohne Netz im Laden.
Ausliefern lässt sie sich als statische Seite, z. B. über Vercel (Framework „Vite“, keine
Umgebungsvariablen nötig).

## Aufbau

```
src/lib/typen.ts        Datenmodell
src/lib/zutaten.ts      Zutatenkatalog: Laden, Abteilung, Haltbarkeit, Saison
src/lib/startrezepte.ts Startrezepte und Frühstücks-Baukasten
src/lib/planer.ts       Wochenvorschlag, Tauschen, Überblick
src/lib/einkauf.ts      Einkaufsliste: Umrechnen, Zusammenzählen, Runden, Sortieren
src/lib/speicher.ts     Laden, Speichern, Sicherung
src/lib/abgleich.ts     Änderungen ↔ Datenbankzeilen (rein, getestet)
src/lib/warteschlange.ts Änderungen, die noch nicht beim Server sind
src/lib/useGemeinsam.ts Anmeldung, Haushalt, Realtime, Nachschicken
supabase/               Migration und Prüfung der Zugriffsrechte
src/seiten/             Woche, Einkauf, Rezepte, Einstellungen
tests/                  Vitest
```

## Nächste Stufen

1. Bewertung nach dem Essen (auch vom Kind), Favoriten öfter, Flops seltener.
2. Wünsche wischen: jeder sagt vor der Planung, worauf er Lust hat; Kinderansicht mit Bildern.
3. Grobe Kosten je Woche, Vorkochplan für Sonntag, Mittwochs-Nachkauf (Brot, Milch).
