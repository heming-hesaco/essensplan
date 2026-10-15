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

## Wo die Daten liegen

**Nur im Browser des jeweiligen Geräts** (`localStorage`). Es gibt kein Konto und keinen
Server. Unter Einstellungen → Daten lässt sich eine Sicherung herunterladen und auf dem
zweiten Handy einlesen. Ein gemeinsamer Stand auf beiden Handys ist der erste Punkt der
nächsten Stufe.

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
src/seiten/             Woche, Einkauf, Rezepte, Einstellungen
tests/                  Vitest
```

## Nächste Stufen

1. Gemeinsamer Stand für beide Handys (Konto je Person, ein Haushalt).
2. Bewertung nach dem Essen (auch vom Kind), Favoriten öfter, Flops seltener.
3. Wünsche wischen: jeder sagt vor der Planung, worauf er Lust hat; Kinderansicht mit Bildern.
4. Grobe Kosten je Woche, Vorkochplan für Sonntag, Mittwochs-Nachkauf (Brot, Milch).
