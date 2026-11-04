# Neue Gerichte, Rezept per Link, gemeinsamer Einkaufszettel

Stand: 04.11.2026 · abgestimmt im Gespräch, Teil 1 bis 3 einzeln bestätigt

## Ausgangslage und Ziel

Die Familie (zwei Erwachsene, ein Kind von sieben Jahren) ist mit den Gerichten unzufrieden:
zu viele Nudeln. 13 der 33 Startgerichte enthalten Nudeln, und das Wochenraster hat einen
festen Nudeltag. Eine frei nutzbare deutsche Rezeptdatenbank gibt es nicht (Chefkoch ohne
offene Schnittstelle, offene Datensätze mit ungeklärter oder nicht kommerzieller Lizenz,
TheMealDB englisch und für öffentliche Apps kostenpflichtig).

**Was gesagt wurde:**

- Gern: Hausmannskost, Mediterranes, Eintöpfe, Aufläufe, Reisgerichte.
- Wenig Fleisch; wenn, dann Hähnchen oder Fisch.
- Abends darf es auch eine Brotzeit sein.
- Ein gemeinsamer Einkaufszettel für alles, auf dem sich Grundnahrungsmittel schnell
  ergänzen lassen und der sich teilen lässt.

**Erfolg heißt:** Der Wochenvorschlag bringt Gerichte, die die Familie essen will; Nudeln
sind die Ausnahme. Was sie im Netz findet, kommt mit einem Link in die eigene Sammlung.
Den Wocheneinkauf und den Nachkauf zwischendurch erledigt ein Zettel, den beide Handys
gleich sehen und den man an Dritte schicken kann.

**Annahmen (nicht ausdrücklich gesagt, im Entwurf so gesetzt):** „Mediterranes“ ist ein
Stil, keine eigene Kategorie – die Gerichte verteilen sich auf die Kategorien. Rind,
Schwein und Wurst kommen im Grundstock gar nicht mehr vor.

## Teil 1: Neuer Grundstock an Gerichten

### Kategorien

Die Ids bleiben, wo es sie gibt, damit gespeicherte Rezepte und Raster gültig bleiben:

| Id | Anzeige | neu? |
|---|---|---|
| `gemuese` | Kartoffeln & Gemüse | Anzeige geändert |
| `eintopf` | Eintopf & Suppe | neu |
| `ofen` | Auflauf & Ofen | Anzeige geändert |
| `reis` | Reis & Pfanne | neu |
| `huelsenfruechte` | Hülsenfrüchte | – |
| `fisch` | Fisch | – |
| `nudeln` | Nudeln | – |
| `brotzeit` | Brotzeit | neu |
| `besonders` | Etwas Besonderes | – |

### Gerichte

60 bis 70 Gerichte in `src/lib/startrezepte.ts`, Mengen für 4 Portionen wie bisher. Grobe
Verteilung: je 8 bis 10 Kartoffeln & Gemüse, Eintopf & Suppe, Auflauf & Ofen, Reis &
Pfanne; 6 bis 8 Fisch; 5 bis 6 Brotzeit; 4 bis 6 Hülsenfrüchte; 4 bis 5 Nudeln; 4 bis 6
Besonderes. Fleisch nur Hähnchen, in höchstens etwa 10 Gerichten. Mediterranes (Shakshuka,
Ratatouille, gefülltes Gemüse, Risotto, Pizza, Flammkuchen) ist auf die Kategorien
verteilt. Jedes Gericht trägt wie bisher Minuten, kinderfreundlich, Zutaten aus dem Katalog
und eine kurze, selbst geschriebene Anleitung.

Neue Zutaten kommen in den Katalog (`zutaten.ts`) mit Laden, Abteilung, Haltbarkeit,
Saison, Symbol und Preis. Fotos: frei lizenziert über Openverse wie bisher, von Hand
ausgewählt, mit Urheber und Lizenz in `startfotos.ts`; ohne passendes Foto die Kachel der
Kategorie (Farbverläufe für `eintopf`, `reis`, `brotzeit` kommen dazu).

### Wochenraster

Neuer Vorschlag: Sa Kartoffeln & Gemüse · So Etwas Besonderes · Mo Eintopf & Suppe ·
Di Reis & Pfanne · Mi Fisch · Do Brotzeit · Fr Wunsch des Kindes. Ein Haushalt, dessen
gespeichertes Raster genau dem alten Vorgaberaster entspricht, bekommt das neue; ein
geändertes Raster bleibt.

### Übergang für bestehende Daten

- `Rezept` bekommt das optionale Feld `archiviert?: boolean`. Archivierte Gerichte
  erscheinen nicht im Vorschlag, nicht beim Tauschen, nicht in der Auswahl „Selbst
  wählen“ und nicht in der Kinderansicht. Pläne, die sie enthalten, zeigen weiter ihren
  Namen. Unter „Rezepte“ zeigt ein Filter „Aussortiert“ sie mit „Wieder aufnehmen“.
- Ein altes Startgericht gilt als **unverändert**, wenn sein Inhalt (Name, Kategorie,
  Minuten, Portionen, kinderfreundlich, Zutaten, Anleitung – ohne Foto) dem
  ausgelieferten Stand entspricht. Dafür liegt im Code eine Liste der alten Ids mit einem
  Prüfwert je Rezept (`startrezepteAlt.ts`). Unveränderte alte Startgerichte, die nicht
  mehr in den Grundstock gehören, werden archiviert; geänderte bleiben unangetastet.
  Unveränderte alte Startgerichte, die es im neuen Grundstock weiter gibt (gleiche Id),
  werden durch die neue Fassung ersetzt.
- Neue Startgerichte werden ergänzt.
- Der Übergang läuft einmal je Haushalt: `einstellungen.grundstock` hält die Fassung
  (fehlt = 1, neu = 2). Er läuft als gewöhnliche Änderung über `aendere`, damit er
  abgeglichen wird; beide Handys kommen zum selben Ergebnis, ein doppelter Lauf schadet
  nicht.
- Bewertungen hängen an der Rezept-Id und bleiben.

## Teil 2: Rezept per Link übernehmen

### Ablauf

Unter „Rezepte“ ein Knopf „Aus Link übernehmen“: Feld für den Link, Knopf „Holen“. Die App
ruft `/api/rezept-import?url=…` auf und öffnet danach das bestehende Rezeptformular,
ausgefüllt mit Name, Portionen, Minuten, Zutaten und Anleitung. Kategorie wählt die Familie
selbst (Vorgabe `gemuese`). Unbekannte Zutaten fragen wie bisher nach dem Laden. Gespeichert
wird ein gewöhnliches eigenes Rezept mit `quelle?: string` (der Link), das in der
Rezeptansicht als „Quelle: <Domain>“ verlinkt ist.

Kein fremdes Foto: das Rezept startet mit der Kachel der Kategorie, ein eigenes Foto geht
wie bisher.

### Server-Funktion `api/rezept-import.ts`

Vercel-Funktion (Node-Laufzeit), Web-Handler `GET(request)`:

- Nur `https:`-Adressen; Host wird per DNS aufgelöst und abgewiesen, wenn eine Adresse
  privat, Loopback, Link-Local oder Multicast ist. Weiterleitungen werden von Hand
  verfolgt (höchstens 3) und jede neue Adresse erneut geprüft.
- Zeitgrenze 8 s, höchstens 3 MB HTML.
- Liest alle `<script type="application/ld+json">`-Blöcke, sucht ein Objekt mit
  `@type` `Recipe` (auch in `@graph` und Arrays, `@type` auch als Liste) und gibt zurück:
  `{ name, portionen, minuten, zutaten: string[], anleitung: string, quelle }`.
  `recipeInstructions` als Text, als `HowToStep`-Liste oder mit `HowToSection` wird zu
  nummerierten Absätzen. Dauer aus `totalTime`, sonst `prepTime` + `cookTime`
  (ISO-8601). Portionen aus der ersten Zahl in `recipeYield`.
- Speichert nichts, setzt keine Cookies, gibt kein HTML weiter.
- Fehler als JSON mit Klartext: „Link ungültig“, „Seite nicht erreichbar“, „Seite enthält
  kein Rezept in lesbarer Form“.

Die Auswertung des HTML liegt als reine Funktion in `api/_rezeptAusHtml.ts`, damit sie ohne
Netz geprüft werden kann.

### Zutatenzeilen zerlegen (`src/lib/zutatZeile.ts`)

`zerlege(zeile, katalog) → { menge, einheit, name, sicher }`:

- Mengen: ganze Zahlen, Komma und Punkt, Brüche (`1/2`, `½`, `¼`, `¾`), Bereiche
  („2–3“ nimmt die obere Zahl).
- Einheiten: g, kg (→ g), ml, l (→ ml), cl (→ ml), EL, TL, Prise, Bund, Dose, Glas,
  Packung/Pck./Päckchen, Zehe(n), Stück/Stk.; ohne Einheit: Stück.
- Name: Klammerzusätze und Beiwörter wie „große, kleine, frische, gehackte“ fallen für den
  Katalogabgleich weg; Einzahl/Mehrzahl-Varianten (Zwiebel/Zwiebeln, Ei/Eier,
  Tomate/Tomaten) treffen denselben Katalogeintrag, dessen Name dann übernommen wird.
- Was sich nicht zerlegen lässt („Salz und Pfeffer“, „etwas Öl“), wird `sicher: false`
  mit der Zeile als Name; das Formular markiert solche Zeilen zur Prüfung.

## Teil 3: Der gemeinsame Einkaufszettel

Die Seite „Einkauf“ wird zum Zettel der Woche. Was bleibt: Zutaten aus dem Plan nach Laden
und Abteilung, Vorrat prüfen, Abhaken, „Alle Haken entfernen“, Teilen je Laden,
Preisschätzung.

### Schnellknöpfe

- `einstellungen.schnellposten: { name: string; laden: Laden }[]`, Vorgabe: Milch, Brot,
  Brötchen, Butter, Eier, Joghurt, Käse, Äpfel, Bananen, Kaffee, Klopapier, Spülmittel
  (Läden aus dem Katalog bzw. Aldi für Haushaltswaren).
- Oben auf dem Zettel als Knopfreihe. Tippen setzt einen eigenen Posten
  (`ExtraPosten { id, text: name, laden }`) auf die Liste; ein Haken am Knopf zeigt, dass
  er draufsteht. Erneutes Tippen nimmt einen so gesetzten Posten wieder herunter.
- Steht dieselbe Zutat schon aus dem Plan auf der Liste (Vergleich über
  `zutatSchluessel`), zeigt der Knopf den Haken mit dem Hinweis „steht schon drauf“ und
  setzt nichts doppelt.
- In den Einstellungen: Knöpfe hinzufügen, entfernen, Laden wählen.

### Freies Feld

Eingabe mit Vorschlagsliste aus Katalog und Schnellposten. Der Laden wird aus dem Katalog
abgeleitet: führende Menge („2 Gurken“) wird für die Suche abgetrennt, Einzahl/Mehrzahl wie
in Teil 2. Ohne Treffer bleibt die Ladenauswahl beim zuletzt gewählten Laden.

### Teilen

Neuer Knopf „Ganzen Zettel teilen“: alle offenen Posten, nach Laden gegliedert, als Text
über `navigator.share`, ohne Share-Funktion in die Zwischenablage. Format:

```
Einkauf Sa 07.11. – Fr 13.11.

Wochenmarkt
• Kartoffeln – 1,5 kg
…

Aldi
• Milch
…
```

### Daten

Keine Datenbankänderung: eigene Posten nutzen die Tabelle `extras`, Schnellposten und
Grundstock-Fassung liegen in `haushalte.einstellungen`.

## Prüfungen

- `zutatZeile`: Mengen, Brüche, Bereiche, Einheiten, Umrechnung, Mehrzahl, unsichere
  Zeilen.
- `_rezeptAusHtml`: Rezept direkt, in `@graph`, in Array, `@type` als Liste,
  Anleitung als Text/Steps/Sections, fehlendes Rezept; Beispielseiten als Fixtures ohne
  Netz.
- Adressprüfung der Funktion: `http:`, private und Loopback-Adressen werden abgewiesen.
- Übergang: unverändertes altes Gericht wird archiviert bzw. ersetzt, geändertes bleibt,
  zweiter Lauf ändert nichts, altes Vorgaberaster wird ersetzt, eigenes bleibt.
- Planer: archivierte Gerichte kommen nicht vor; mit neuem Raster und Grundstock kommen
  in 20 Vorschlägen höchstens 1 Nudelgericht je Woche und kein Rind/Schwein.
- Grundstock: jede Zutat im Katalog mit Preis, Kategorien gültig, Ids eindeutig.
- Zettel: Schnellknopf setzt und entfernt, kein Doppel bei Planzutat, Ladenableitung im
  freien Feld, Text für „Ganzen Zettel teilen“.

## Nicht Teil dieses Vorhabens

Suche in fremden Rezeptseiten aus der App heraus, Massenimport, Übernahme fremder Fotos,
Mengen oder Preise für eigene Posten.
