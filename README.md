# Essensplan

Ein Wochenplan fürs Essen für zwei Erwachsene und ein Kind – mit dem Ziel, **einmal in der
Woche** einzukaufen: Samstag Wochenmarkt (Obst, Gemüse, Brot, Käse, Eier), danach Aldi
(Grundlebensmittel), Edeka nur für Besonderes.

## Was die App kann

**Wochenplan (Samstag bis Freitag).** Ein Knopf schlägt sieben Abendessen vor, nach einem
Wochenraster, das ihr in den Einstellungen ändern könnt:

| Sa | So | Mo | Di | Mi | Do | Fr |
|---|---|---|---|---|---|---|
| Kartoffeln & Gemüse (Markttag) | Etwas Besonderes | Eintopf & Suppe | Reis & Pfanne | Fisch | Brotzeit | Wunsch des Kindes |

Der Vorschlag
- nimmt bevorzugt **Saisonware** (Saisonkalender für Deutschland im Zutatenkatalog),
- verteilt frische Zutaten auf **mehrere Gerichte** (der halbe Kürbis vom Samstag landet am
  Dienstag im Risotto),
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
Oben auf dem Zettel stehen **Schnellknöpfe** für Grundnahrungsmittel (Milch, Brot,
Brötchen, Butter, Eier, Joghurt, Käse, Äpfel, Bananen, Kaffee, Klopapier, Spülmittel): ein
Tippen setzt den Posten drauf, ein zweites nimmt ihn wieder herunter. Steht etwas schon über
den Wochenplan drauf, zeigt der Knopf einen Haken und setzt nichts doppelt. Die Knöpfe lassen
sich unter Einstellungen ändern. Ins freie Feld tippt man alles andere („2 Gurken“); der Laden
wird aus dem Katalog vorgeschlagen. **„Ganzen Zettel teilen“** schickt alle offenen Posten,
nach Laden gegliedert, per WhatsApp, SMS oder Mail.

**Rezepte.** 63 Startgerichte (Grundstock 2, seit 11/2026): Hausmannskost, Mediterranes,
Eintöpfe, Aufläufe, Reisgerichte und Brotzeit; Fleisch nur Hähnchen, Nudeln nur noch fünfmal.
Eigene Rezepte anlegen, ändern, kopieren, löschen. Für eine neue Zutat fragt das Formular, in
welchem Laden ihr sie kauft. Unter Einstellungen lässt sich für jede Zutat der Laden ändern.

**Umstellung vom ersten Grundstock.** Ein Haushalt mit den 33 Gerichten von Oktober wird
einmal umgestellt (`src/lib/grundstock.ts`): unveränderte alte Startgerichte bekommen die neue
Fassung oder werden **aussortiert** – nicht gelöscht, alte Pläne zeigen weiter ihren Namen,
und unter Rezepte → „Aussortiert“ lassen sie sich wieder aufnehmen. Was ihr an einem
Startgericht geändert habt, bleibt unangetastet; erkannt wird das an Prüfwerten des alten
Grundstocks (`startrezepteAlt.ts`). Ein nie geändertes Wochenraster bekommt das neue.

**Rezept per Link übernehmen.** Unter Rezepte → „Aus Link übernehmen“ einen Link von
Chefkoch, Lecker, EatSmarter o. ä. einfügen. Die Server-Funktion `api/rezept-import.ts` holt
die Seite und liest die maschinenlesbaren Rezeptangaben (schema.org/Recipe), die fast alle
Rezeptseiten für Suchmaschinen mitliefern; die App zerlegt die Zutatenzeilen in Menge,
Einheit und Zutat (`src/lib/zutatZeile.ts`) und öffnet das Formular zum Prüfen. Unlesbare
Zeilen sind gelb markiert. Grenzen: Seiten, die den Abruf sperren, und Seiten ohne
Rezeptangaben lassen sich nur von Hand anlegen; das Foto der fremden Seite wird nicht
übernommen, die Quelle steht als Link am Rezept. Die Funktion ruft nur `https`-Adressen
außerhalb privater Netze ab (auch nach Weiterleitungen), höchstens 3 MB in 8 Sekunden, und
speichert nichts.

**Fotos und Bewertungen.** 38 der 63 Startgerichte haben ein Foto: frei lizenziert
(CC BY, CC BY-SA), gefunden über Openverse, gehostet bei Flickr, jedes von Hand ausgewählt.
Urheber und Lizenz stehen in der Rezeptansicht. Wo kein passendes Foto zu finden war, zeigt
die App eine farbige Kachel mit dem Symbol der Kategorie. Im gemeinsamen Haushalt lässt sich
jedes Gericht selbst fotografieren; das Foto wird auf 1000 Pixel verkleinert und liegt privat
im Speicher des Haushalts. Zutaten tragen in Liste und Rezept ein Symbol.

Jede Person (Namen in den Einstellungen) bewertet ein Gericht mit 😋 lecker, 🙂 geht so oder
😖 nicht nochmal, im Wochenplan ab dem Tag des Essens („Wie war’s?“) oder in der
Rezeptansicht. Der Wochenvorschlag gibt je „lecker“ +0,8 Punkte und je „nicht nochmal“ −8 –
mehr, als ein Gericht sonst sammeln kann. Ein abgelehntes Gericht kommt also nur, wenn für
den Tag nichts anderes passt. Unter Rezepte filtert „Lieblinge“ auf Gerichte, die mindestens
zwei lecker finden und keiner ablehnt.

**Kinderansicht.** Der Reiter mit dem Namen des Kindes (unter Einstellungen → „Wer
bewertet?“, Person 3) zeigt groß, was es heute gibt, die Woche als Bilderleiste und alle
Gerichte, die als „Isst das Kind gern“ markiert sind. Was das Kind mit „Mag ich nicht“
bewertet hat, fällt dort weg. Das Kind darf sich **drei Gerichte wünschen**. Ein Wunsch
kommt im nächsten Wochenvorschlag zuerst an den Kinderwunsch-Tag und sonst mit +4 Punkten
an seinen Kategorietag. Gegen ein „nicht nochmal“ der anderen kommt er nicht an. Ob ein
Wunsch erfüllt ist, liest die App aus den Plänen ab: Steht das Gericht ab dem Wunsch im
Plan, heißt es „Gibt’s am Freitag! 🎉“; ist der Tag vorbei, wird der Platz für einen neuen
Wunsch frei. Im Wochenplan stehen offene Wünsche oben, gewünschte Gerichte tragen „⭐
Wunsch von …“. In der Kinderansicht heißen die „Nudeln mit versteckter Gemüsesauce“ nur
„Nudeln mit Gemüsesauce“.

**Grobe Kosten.** Jede Zutat hat einen geschätzten Preis (Discounter-Niveau, auf dem Markt
etwas darüber; bei g je Kilogramm, bei ml je Liter, sonst je Stück, Dose, Bund).
Gerechnet wird mit dem, was verbraucht wird: Eine angebrochene Packung zählt anteilig.
Grundvorrat und eigene Posten zählen nicht mit. Die Summe steht auf der Einkaufsliste
(gesamt und je Laden), in „Die Woche im Blick“ (dazu Abendessen und Schnitt je Abend), an
jedem Tag und in der Rezeptansicht. Unter Einstellungen → „Wo wird was gekauft – und was
kostet es?“ lassen sich die Preise durch die eigenen ersetzen; ein leeres Feld nimmt den
Startwert. Mit den Startpreisen kostet eine Woche für drei etwa 75 bis 85 €, ein
Abendessen zwischen 2 und 7,60 €.

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

Das Projekt liegt in einer eigenen Supabase-Organisation im Tarif Free (Frankfurt). Ein
Free-Projekt pausiert nach sieben Tagen ohne Nutzung; bei wöchentlicher Planung kommt das
kaum vor, und im Supabase-Dashboard lässt es sich mit einem Klick wieder starten. Bis dahin
arbeitet die App mit dem Stand auf dem Gerät weiter und schickt danach nach.

Die Datenbankprüfung läuft gegen eine Wegwerf-Datenbank, nie gegen das echte Projekt:

```bash
docker run -d --name pg-test -e POSTGRES_PASSWORD=postgres -p 54329:5432 public.ecr.aws/supabase/postgres:17.6.1.010
export PGPASSWORD=postgres
psql -h localhost -p 54329 -U supabase_admin -d postgres -f supabase/tests/_speicher_vorbereiten.sql
for f in supabase/migrations/*.sql; do psql -h localhost -p 54329 -U postgres -d postgres -f "$f"; done
psql -h localhost -p 54329 -U postgres -d postgres -v ON_ERROR_STOP=1 -f supabase/tests/haushalt.sql
```

`_speicher_vorbereiten.sql` ergänzt im nackten Image, was im echten Supabase die
Storage-API anlegt; gegen das echte Projekt wird es nie ausgeführt. Bekannte Lücke: Verlässt
das letzte Konto den Haushalt, bleiben dessen eigene Fotos im Speicher liegen.

## Benutzen

```bash
npm install
npm run dev        # Entwicklung: http://localhost:5173
npm test           # Prüfungen der Planungs- und Einkaufslogik
npm run build      # fertige Dateien in dist/
```

**Live unter https://essensplan-hesaco.vercel.app** (Vercel-Projekt `essensplan` im Team
HESACO). Das Projekt ist noch **nicht mit GitHub verknüpft**: Der Vercel-GitHub-App fehlt die
Freigabe für dieses Repository. Bis das nachgeholt ist (Vercel → Projekt → Settings → Git →
GitHub), geht ein Push auf `main` **nicht** von selbst live; die Bereitstellung erfolgt per
Upload der Quelldateien. Die beiden `VITE_SUPABASE_*`-Werte stehen dort als
Umgebungsvariablen. Der Vercel-Schutz gilt nur für Vorschauen, die Produktionsadresse ist ohne
Anmeldung erreichbar.

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
src/lib/bewertung.ts    Bewertungen und ihr Gewicht im Vorschlag
src/lib/foto.ts         Eigene Fotos: verkleinern, hochladen, signierte Links
src/lib/startfotos.ts   Fotos der Startgerichte mit Urheber und Lizenz
src/lib/kosten.ts       Grobe Kosten je Gericht, Woche und Laden
src/lib/grundstock.ts   Umstellung auf den neuen Grundstock, Prüfwerte
src/lib/zutatZeile.ts   Zutatenzeilen fremder Rezepte zerlegen
src/lib/rezeptImport.ts Übernommenes Rezept → eigenes Rezept
src/lib/zettel.ts       Schnellknöpfe, Laden fürs freie Feld, Zettel als Text
api/rezept-import.ts    Server-Funktion: Rezept aus einem Link lesen
src/lib/wuensche.ts     Wünsche des Kindes: offen, eingeplant, erfüllt
supabase/               Migration und Prüfung der Zugriffsrechte
src/seiten/             Woche, Einkauf, Rezepte, Kind, Einstellungen
tests/                  Vitest
```

## Nächste Stufen

1. Vorkochplan für Sonntag.
2. Rezept direkt aus dem Teilen-Menü des Handys übernehmen (PWA-Share-Target).
