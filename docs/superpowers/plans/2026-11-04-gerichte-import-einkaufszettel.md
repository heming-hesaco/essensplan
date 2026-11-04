# Neue Gerichte, Rezept per Link, Einkaufszettel – Bauplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den Grundstock auf 60–70 Gerichte nach dem Geschmack der Familie umstellen, Rezepte per Link übernehmen und die Einkaufsseite zum gemeinsamen Zettel mit Schnellknöpfen und „Ganzen Zettel teilen“ machen.

**Architecture:** Reine Logik in `src/lib/` (getestet mit Vitest), Oberfläche in `src/seiten/`. Neu sind eine Vercel-Funktion `api/rezept-import.ts` mit reiner Auswertung in `api/_rezeptAusHtml.ts` und ein einmaliger Übergang alter Haushalte über `stelleGrundstockUm`, der als gewöhnliche Änderung abgeglichen wird. Keine Datenbankänderung.

**Tech Stack:** Vite 6, React 19, TypeScript 5.8 (strict), Vitest 3, Supabase JS 2, Vercel Functions (Node-Laufzeit, Web-Handler), Node 22.

**Spec:** `docs/superpowers/specs/2026-11-04-gerichte-import-einkaufszettel-design.md`

## Global Constraints

- Alle Oberflächentexte und Code-Bezeichner auf Deutsch, wie im Bestand.
- Fleisch im Grundstock nur Hähnchen; kein Rind, kein Schwein, keine Wurst, kein Schinken.
- Nudelgerichte im Grundstock: 4 bis 5.
- Neues Vorgaberaster: `['gemuese', 'besonders', 'eintopf', 'reis', 'fisch', 'brotzeit', 'kinderwunsch']`.
- Grundstock-Fassung: `einstellungen.grundstock` fehlt = 1, neu = 2.
- Import-Funktion: nur `https:`, höchstens 3 Weiterleitungen, 8 s, 3 MB, private/Loopback/Link-Local/Multicast-Adressen abgewiesen, speichert nichts.
- Kein fremdes Foto beim Import; Quelle als Link am Rezept.
- Schnellposten-Vorgabe: Milch, Brot, Brötchen, Butter, Eier, Joghurt, Käse, Äpfel, Bananen, Kaffee, Klopapier, Spülmittel.
- Keine neue npm-Abhängigkeit.
- Nach jeder Aufgabe: `npm run typecheck` und `npm test` grün.

## Review Focus

- Link einer Rezeptseite mit Tracking-Parametern oder Mobil-Host (`m.`/`?utm_…`) → wird wie der normale Link gelesen (Test in Task 8).
- Seite, die den Abruf sperrt (403/429) oder kein Rezept enthält → Klartextmeldung und Angebot, von Hand anzulegen; kein leeres Formular (Tests in Task 8 und 9).
- Beide Handys führen den Übergang gleichzeitig aus → gleiches Ergebnis, keine doppelten Rezepte (Test in Task 6: zweimal anwenden = einmal).
- Zutatenzeile „1 Prise Salz“ oder „Salz und Pfeffer“ → landet als Grundvorrat, nicht als Edeka-Unbekanntes (Test in Task 7).
- Schnellknopf in den Einstellungen gelöscht, während der Posten auf dem Zettel steht → Posten bleibt stehen und ist abhakbar (Test in Task 10).

---

### Task 1: Kategorien und Rezeptfelder erweitern

**Files:**
- Modify: `src/lib/typen.ts` (Kategorie, KATEGORIEN, Rezept, Einstellungen)
- Modify: `src/seiten/Bausteine.tsx:7-9` (KATEGORIE_BILD)
- Modify: `src/styles.css` (Farbverläufe)
- Test: `tests/startdaten.test.ts`

**Interfaces:**
- Produces:
  - `type Kategorie = 'gemuese' | 'eintopf' | 'ofen' | 'reis' | 'huelsenfruechte' | 'fisch' | 'nudeln' | 'brotzeit' | 'besonders'` (diese Reihenfolge auch in `KATEGORIEN`)
  - `KATEGORIEN` Anzeige: gemuese „Kartoffeln & Gemüse“, eintopf „Eintopf & Suppe“, ofen „Auflauf & Ofen“, reis „Reis & Pfanne“, huelsenfruechte „Hülsenfrüchte“, fisch „Fisch“, nudeln „Nudeln“, brotzeit „Brotzeit“, besonders „Etwas Besonderes“
  - `Rezept.archiviert?: boolean`, `Rezept.quelle?: string`
  - `Einstellungen.grundstock?: number`, `Einstellungen.schnellposten?: { name: string; laden: Laden }[]`

- [ ] **Step 1: Test** `it('Kategorien in fester Reihenfolge')`: `expect(Object.keys(KATEGORIEN)).toEqual(['gemuese','eintopf','ofen','reis','huelsenfruechte','fisch','nudeln','brotzeit','besonders'])`.
- [ ] **Step 2:** `npx vitest run tests/startdaten.test.ts` → FAIL.
- [ ] **Step 3:** Typen und Anzeigen wie oben; `KATEGORIE_BILD` ergänzt um eintopf 🍲 (ofen wird 🥘), reis 🍚, brotzeit 🥪; CSS-Klassen `.kat-eintopf`, `.kat-reis`, `.kat-brotzeit` mit Verläufen im Stil der bestehenden.
- [ ] **Step 4:** `npm run typecheck && npm test` → grün.
- [ ] **Step 5:** Commit „Kategorien Eintopf, Reis, Brotzeit; Felder archiviert und quelle“.

### Task 2: Aussortierte Gerichte ausblenden

**Files:**
- Modify: `src/lib/planer.ts` (`besteWahl`)
- Modify: `src/seiten/Plan.tsx:232` (Auswahl „Selbst wählen“), `src/seiten/Kind.tsx:59`, `src/seiten/Rezepte.tsx` (Liste, Filter, Knopf)
- Test: `tests/planer.test.ts`

**Interfaces:**
- Consumes: `Rezept.archiviert` (Task 1)
- Produces: Planer und Oberflächen ignorieren `archiviert === true`; Rezepte-Filterchip „Aussortiert“ (Wert `'archiv'` im Kategorie-Filter) zeigt nur archivierte, Detailansicht eines archivierten zeigt Knopf „Wieder aufnehmen“ (setzt `archiviert` weg).

- [ ] **Step 1: Test** `it('aussortierte Gerichte kommen nicht in den Vorschlag')`: alle Startrezepte bis auf eines je Kategorie archivieren, 10 Saaten, `schlageWocheVor` → kein Tag mit archivierter Id; `tauscheTag` ebenso.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** In `besteWahl` `frei` um `!r.archiviert` filtern; Oberflächen wie beschrieben. Die Hauptliste der Rezepte und „Lieblinge“ zeigen keine archivierten.
- [ ] **Step 4:** `npm test` → grün.
- [ ] **Step 5:** Commit „Aussortierte Gerichte ausblenden, wieder aufnehmen“.

### Task 3: Prüfwerte des alten Grundstocks festhalten

Muss vor Task 4 laufen – danach gibt es den alten Grundstock im Code nicht mehr.

**Files:**
- Create: `src/lib/grundstock.ts`
- Create: `src/lib/startrezepteAlt.ts` (erzeugt, nicht von Hand)
- Test: `tests/grundstock.test.ts`

**Interfaces:**
- Produces:
  - `pruefwert(r: Rezept): string` – FNV-1a (32 Bit, hex) über `JSON.stringify([r.name, r.kategorie, r.minuten, r.portionen, r.kinderfreundlich, r.zutaten, r.anleitung])`
  - `ALTE_STARTREZEPTE: Record<string, string>` – Id → Prüfwert der 33 bisherigen Startgerichte

- [ ] **Step 1: Test** `it('Prüfwert hängt am Inhalt, nicht am Foto')`: gleicher Wert mit/ohne `foto`, anderer Wert bei geänderten `minuten`.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** `pruefwert` implementieren; `startrezepteAlt.ts` einmalig mit einem Hilfstest erzeugen, der die Datei aus dem jetzigen `STARTREZEPTE` schreibt, und den Hilfstest danach löschen.
- [ ] **Step 4: Test** `it('Schnappschuss passt zum jetzigen Grundstock')` nur in diesem Commit: jeder Eintrag von `STARTREZEPTE` hat in `ALTE_STARTREZEPTE` denselben Prüfwert, 33 Einträge. Wird in Task 4 durch „33 Einträge, Werte hex“ ersetzt.
- [ ] **Step 5:** `npm test` → grün; Commit „Prüfwerte des bisherigen Grundstocks“.

### Task 4: Neuer Grundstock und Raster

**Files:**
- Modify: `src/lib/zutaten.ts` (neue Zutaten mit Laden, Abteilung, Haltbarkeit, Saison, Symbol, Preis)
- Modify: `src/lib/startrezepte.ts` (60–70 Gerichte), `src/lib/speicher.ts` (`START_RASTER`)
- Modify: `src/lib/startfotos.ts` (Einträge entfernter Ids löschen)
- Modify: Tests mit Ids, die es nicht mehr gibt: `tests/bewertung.test.ts`, `tests/wuensche.test.ts`, `tests/planer.test.ts`, `tests/kosten.test.ts`, `tests/einkauf.test.ts`
- Test: `tests/startdaten.test.ts`, `tests/planer.test.ts`

**Interfaces:**
- Produces: `STARTREZEPTE` (neu), `START_RASTER` wie in Global Constraints. Behaltene Ids, deren Gericht passt (etwa `kuerbissuppe`, `ofenlachs-kartoffeln`, `apfelpfannkuchen`, `kartoffelpuffer-apfelmus`, `minestrone`, `chili-sin-carne`, `haehnchen-blech`), bleiben gleich.

- [ ] **Step 1: Tests** in `startdaten.test.ts`, den alten Nudeltest ersetzen:
  - `it('60 bis 70 Gerichte, 4 bis 5 mit Nudeln')`
  - `it('Fleisch nur Hähnchen')`: jede Zutat mit Abteilung `fleisch` beginnt mit „Hähnchen“; höchstens 10 Gerichte mit Hähnchen
  - `it('jede Kategorie mindestens 4 Gerichte, Brotzeit mindestens 5')`
  - `it('jede Zutat außer Grundvorrat hat einen Preis in der benutzten Einheit')` (statt nur über `gerichtKosten`)
  - in `planer.test.ts` `it('höchstens ein Nudelgericht je Woche')`: 20 Saaten mit `START_RASTER`, Monat 11 → je Plan ≤ 1 Rezept der Kategorie `nudeln`
- [ ] **Step 2:** Tests → FAIL.
- [ ] **Step 3:** Grundstock nach Spec Teil 1 schreiben (Verteilung je Kategorie, Mediterranes verteilt, Anleitungen selbst formuliert, Mengen für 4 Portionen); fehlende Zutaten im Katalog ergänzen; `START_RASTER` umstellen. Tests, die entfernte Ids nennen, auf behaltene Ids umstellen, ohne ihre Aussage zu ändern.
- [ ] **Step 4:** `npm run typecheck && npm test` → grün; Kosten-Plausibilität (`tests/kosten.test.ts`: 1 € < Gericht < 20 €, Woche 40–160 €) weiter grün.
- [ ] **Step 5:** Commit „Neuer Grundstock: Hausmannskost, Eintöpfe, Aufläufe, Reis, Brotzeit“.

### Task 5: Fotos der neuen Gerichte

**Files:**
- Modify: `src/lib/startfotos.ts`
- Test: `tests/startdaten.test.ts` (bestehender Foto-Test)

**Interfaces:**
- Consumes: Ids aus Task 4.

- [ ] **Step 1:** Für jedes neue Gericht ohne Foto über Openverse (`api.openverse.org/v1/images/?q=…&license=by,by-sa,cc0,pdm&source=flickr`) Kandidaten suchen, ansehen, passende als `{ art: 'frei', quelle: 'Flickr', url: …_z.jpg, seite, autor, lizenz }` eintragen. Kein Foto, das das Gericht nicht zeigt.
- [ ] **Step 2:** `npm test` → Foto-Test grün (Urheber, Lizenz, Flickr-Adresse).
- [ ] **Step 3:** Commit „Fotos der neuen Gerichte“.

### Task 6: Übergang alter Haushalte

**Files:**
- Modify: `src/lib/grundstock.ts`
- Modify: `src/App.tsx` (Effekt nach Laden und nach jedem `setzeVomServer`)
- Test: `tests/grundstock.test.ts`

**Interfaces:**
- Consumes: `pruefwert`, `ALTE_STARTREZEPTE` (Task 3), `STARTREZEPTE`, `START_RASTER` (Task 4)
- Produces: `GRUNDSTOCK = 2`, `ALTES_RASTER: Feld[]` (das bisherige Vorgaberaster), `stelleGrundstockUm(z: Zustand): Zustand` – unverändert wenn `einstellungen.grundstock === 2`; sonst:
  - alte Id, unverändert (Prüfwert gleich), im neuen Grundstock vorhanden → durch neue Fassung ersetzt (eigenes Foto bleibt)
  - alte Id, unverändert, nicht mehr vorhanden → `archiviert: true`
  - alte Id, geändert → unangetastet
  - neue Ids, die fehlen → ergänzt
  - `raster` gleich `ALTES_RASTER` → `START_RASTER`
  - `einstellungen.grundstock = 2`

- [ ] **Step 1: Tests**:
  - `it('unverändertes altes Gericht wird aussortiert, geändertes bleibt')`
  - `it('behaltene Id bekommt die neue Fassung, eigenes Foto bleibt')`
  - `it('neue Gerichte kommen dazu, keine doppelten Ids')`
  - `it('altes Vorgaberaster wird ersetzt, eigenes bleibt')`
  - `it('zweimal anwenden ändert nichts mehr')`: `stelleGrundstockUm(stelleGrundstockUm(z))` gleich `stelleGrundstockUm(z)`, und `aenderungen(einmal, zweimal)` ist leer
  - `it('Bewertungen bleiben')`
- [ ] **Step 2:** Tests → FAIL.
- [ ] **Step 3:** Implementieren. In `App.tsx` ein Effekt auf `z.einstellungen.grundstock`: ist er nicht 2 und gilt `!gemeinsam.email || (gemeinsam.haushaltGeprueft && (!gemeinsam.haushalt || gemeinsam.haushalt.einladungscode !== ''))`, `aendere(stelleGrundstockUm)` aufrufen – nie, solange der Haushalt noch lädt, sonst würde der Stand des Geräts statt des Haushalts umgestellt.
- [ ] **Step 4:** `npm test` → grün.
- [ ] **Step 5:** Commit „Übergang alter Haushalte auf den neuen Grundstock“.

### Task 7: Zutatenzeilen zerlegen

**Files:**
- Modify: `src/lib/zutaten.ts` (`findeZutat`)
- Create: `src/lib/zutatZeile.ts`
- Test: `tests/zutatZeile.test.ts`

**Interfaces:**
- Produces:
  - `findeZutat(name: string, katalog: Katalog): ZutatInfo | null` – exakt, dann nach Wegnehmen von Beiwörtern (große, kleine, mittelgroße, frische, frischer, gehackte, getrocknete, reife) und Klammern, dann Einzahl/Mehrzahl (Endungen -n, -en, -e, -s, -er/Eier↔Ei, Umlaut nicht)
  - `zerlege(zeile: string, katalog: Katalog): { menge: number; einheit: Einheit; name: string; sicher: boolean }`

- [ ] **Step 1: Tests** (`it.each`):
  - `'200 g Mehl'` → 200, g, Mehl, sicher
  - `'1 kg Kartoffeln, mehligkochend'` → 1000, g, Kartoffeln
  - `'0,5 l Milch'` → 500, ml, Milch; `'250ml Sahne'` → 250, ml, Sahne
  - `'½ TL Salz'` → 0.5, TL, Salz; `'1 1/2 EL Olivenöl'` → 1.5, EL, Olivenöl
  - `'2-3 Zehen Knoblauch'` → 3, Zehe, Knoblauch
  - `'1 große Zwiebel'` → 1, Stück, Zwiebeln; `'2 Eier (Größe M)'` → 2, Stück, Eier
  - `'1 Dose stückige Tomaten'` → 1, Dose, Name „stückige Tomaten“ (nicht im Katalog, sicher)
  - `'1 Pck. Backpulver'` → 1, Packung
  - `'Salz und Pfeffer'` → `sicher: false`; `'1 Prise Salz'` → Prise, Salz (Grundvorrat laut Katalog)
- [ ] **Step 2:** Tests → FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** `npm test` → grün.
- [ ] **Step 5:** Commit „Zutatenzeilen zerlegen und Katalog finden“.

### Task 8: Import-Funktion

**Files:**
- Create: `api/_rezeptAusHtml.ts`, `api/_adresse.ts`, `api/rezept-import.ts`
- Modify: `tsconfig.json` (`include` um `api`)
- Create: `tests/api/rezeptAusHtml.test.ts`, `tests/api/adresse.test.ts`, Fixtures `tests/api/fixtures/*.html` (selbst geschriebene Mini-Seiten, keine kopierten Fremdseiten)

**Interfaces:**
- Produces:
  - `rezeptAusHtml(html: string, quelle: string): ImportRezept | null` mit `ImportRezept = { name: string; portionen: number | null; minuten: number | null; zutaten: string[]; anleitung: string; quelle: string }`
  - `pruefeAdresse(url: string): { ok: true; url: URL } | { ok: false; grund: string }` (Form) und `istPrivateAdresse(ip: string): boolean`
  - `GET(request: Request): Promise<Response>` – Antwort `200 ImportRezept` oder `4xx/5xx { fehler: string }` mit den Texten der Spec

- [ ] **Step 1: Tests** `rezeptAusHtml`: Recipe direkt; in `@graph`; im Array; `@type: ['Recipe','NewsArticle']`; Anleitung als Text, `HowToStep[]`, `HowToSection` mit Steps → nummerierte Absätze; `totalTime 'PT1H15M'` → 75; ohne `totalTime` `prepTime` + `cookTime`; `recipeYield: '4 Portionen'` → 4, `['4','4 Stück']` → 4; HTML-Entities in Zutaten dekodiert; kaputter JSON-Block neben gültigem wird übersprungen; ohne Recipe → `null`.
- [ ] **Step 2: Tests** Adresse: `http://…` abgewiesen; `https://localhost`, `https://127.0.0.1`, `https://10.1.2.3`, `https://192.168.0.1`, `https://[::1]` abgewiesen; `istPrivateAdresse` für 169.254.x, 172.16–31.x, fc00::/7, fe80::/10, 224.0.0.0/4 → true; `https://www.chefkoch.de/rezepte/123/x.html?utm_source=a` → ok.
- [ ] **Step 3:** Tests → FAIL.
- [ ] **Step 4:** Implementieren. `GET`: `url`-Parameter prüfen; Host mit `node:dns/promises` `lookup(host, { all: true })` auflösen, jede Adresse prüfen; `fetch` mit `redirect: 'manual'`, `AbortSignal.timeout(8000)`, Header `user-agent: Mozilla/5.0 (essensplan; Rezeptimport)`, `accept-language: de`; Weiterleitung bis 3× erneut prüfen; Body gestreamt bis 3 MB; 403/429 → „Die Seite lässt keinen Abruf zu. Rezept bitte von Hand anlegen.“; kein Rezept → „Seite enthält kein Rezept in lesbarer Form“. `cache-control: no-store`.
- [ ] **Step 5:** `npm run typecheck && npm test` → grün.
- [ ] **Step 6:** Commit „Server-Funktion: Rezept aus Link lesen“.

### Task 9: Import in der Oberfläche

**Files:**
- Modify: `src/seiten/Rezepte.tsx` (Knopf, Abruf, Vorbefüllung, Quelle in Detailansicht, Markierung unsicherer Zeilen)
- Create: `src/lib/rezeptImport.ts`
- Modify: `src/styles.css`
- Test: `tests/rezeptImport.test.ts`

**Interfaces:**
- Consumes: `ImportRezept` (Task 8), `zerlege` (Task 7)
- Produces: `alsRezept(imp: ImportRezept, katalog: Katalog, id: string): { rezept: Rezept; unsicher: number[] }` – Kategorie `'gemuese'`, `kinderfreundlich: false`, Portionen `imp.portionen ?? 4`, Minuten `imp.minuten ?? 30`, `quelle: imp.quelle`, ohne `foto`; `unsicher` = Indizes der Zutaten mit `sicher: false`

- [ ] **Step 1: Tests** `alsRezept`: Felder wie oben; unsichere Indizes; leere Zutatenliste → eine leere Zeile, damit das Formular nicht leer startet.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Implementieren; in `Rezepte.tsx` Kopfknopf „Aus Link übernehmen“ → Eingabe + „Holen“ → `fetch('/api/rezept-import?url=' + encodeURIComponent(link))`; bei Fehler Meldung plus Knopf „Von Hand anlegen“ (leeres Formular mit `quelle`); bei Erfolg `RezeptFormular` mit `alsRezept(...)`, unsichere Zeilen mit Klasse `pruefen` und Hinweis „Bitte prüfen“. Detailansicht: „Quelle: <Domain>“ als Link mit `rel="noreferrer"`.
- [ ] **Step 4:** `npm test` → grün; im Browser (Dev-Server, `vercel dev` nicht nötig: Abruf gegen eine lokale Mock-Antwort genügt) Formular mit Vorbefüllung ansehen.
- [ ] **Step 5:** Commit „Rezept per Link übernehmen“.

### Task 10: Logik des Einkaufszettels

**Files:**
- Create: `src/lib/zettel.ts`
- Modify: `src/lib/speicher.ts` (`mitPersonen` → zusätzlich Vorgabe für `schnellposten`)
- Test: `tests/zettel.test.ts`

**Interfaces:**
- Consumes: `findeZutat` (Task 7), `Posten` (`einkauf.ts`), `ExtraPosten`
- Produces:
  - `START_SCHNELLPOSTEN: { name: string; laden: Laden }[]` (Liste aus Global Constraints; Laden aus Katalog, Kaffee/Klopapier/Spülmittel → `'aldi'`, Brot/Brötchen → `'markt'`)
  - `schnellStand(name: string, posten: Posten[], extras: ExtraPosten[]): 'frei' | 'eigen' | 'plan'`
  - `schalteSchnellposten(extras: ExtraPosten[], s: { name: string; laden: Laden }, neueId: () => string): ExtraPosten[]`
  - `ladenFuer(text: string, katalog: Katalog): Laden | null` (führende Menge/Einheit abtrennen)
  - `zettelText(wochentitel: string, posten: Posten[], extras: ExtraPosten[], abgehakt: Set<string>): string` im Format der Spec

- [ ] **Step 1: Tests**:
  - `schnellStand('Milch', [Posten Milch], [])` → `'plan'`; mit Extra „milch“ → `'eigen'`
  - `schalteSchnellposten` setzt und nimmt wieder heraus; bei `'plan'` ruft die Oberfläche es nicht auf (kein Test nötig)
  - Schnellposten aus der Liste der Einstellungen entfernt → Extra bleibt in `extras` (Funktion fasst `extras` nicht an)
  - `ladenFuer('2 Gurken', katalog)` → `'markt'`; `ladenFuer('Zahnpasta', katalog)` → `null`
  - `zettelText`: Abgehaktes fehlt, Läden ohne offene Posten fehlen, Reihenfolge Wochenmarkt/Aldi/Edeka, Mengen über `zeigeMenge`
  - `pruefe({...ohne schnellposten})` → `einstellungen.schnellposten` gleich `START_SCHNELLPOSTEN`
- [ ] **Step 2:** Tests → FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** `npm test` → grün.
- [ ] **Step 5:** Commit „Einkaufszettel: Schnellposten, Laden ableiten, Text zum Teilen“.

### Task 11: Einkaufszettel in der Oberfläche

**Files:**
- Modify: `src/seiten/Einkauf.tsx`, `src/seiten/Einstellungen.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: alles aus Task 10

- [ ] **Step 1:** `Einkauf.tsx`: Knopfreihe der Schnellposten oben (Haken bei `'eigen'`/`'plan'`, bei `'plan'` kurzer Hinweis „steht schon drauf“); freies Feld mit `<datalist>` aus Katalog und Schnellposten, Laden per `ladenFuer`, sonst zuletzt gewählter; Knopf „Ganzen Zettel teilen“ über `zettelText` (Teilen, sonst Zwischenablage mit Meldung). Teilen je Laden bleibt.
- [ ] **Step 2:** `Einstellungen.tsx`: Abschnitt „Schnellknöpfe auf dem Einkaufszettel“ – Liste mit Name, Laden-Auswahl, ✕; Feld + „Hinzufügen“.
- [ ] **Step 3:** Prüfen im Browser (390 px breit): Knopf setzen/entfernen, Planzutat zeigt Haken, freies Feld „2 Gurken“ landet beim Wochenmarkt, „Ganzen Zettel teilen“ kopiert den Text; `npm run typecheck && npm test && npm run build` → grün.
- [ ] **Step 4:** Commit „Gemeinsamer Einkaufszettel mit Schnellknöpfen“.

### Task 12: Dokumentation, Bereitstellung, Abnahme

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** README: neue Kategorien und Raster, Übergang, „Aus Link übernehmen“ samt Grenzen (gesperrte Seiten, keine Fotos), Einkaufszettel; Abschnitt „Nächste Stufen“ anpassen.
- [ ] **Step 2:** Commit, `git push origin main`.
- [ ] **Step 3:** Produktiv bereitstellen (Vercel-Projekt `essensplan`, Dateien inklusive `api/`), danach Datei-Prüfwerte der Bereitstellung mit dem Repository vergleichen.
- [ ] **Step 4:** Abnahme auf `https://essensplan-hesaco.vercel.app` (390 px): Woche vorschlagen – kein Nudeltag, Donnerstag Brotzeit; `/api/rezept-import?url=<eine öffentliche Rezeptseite>` liefert ein Rezept, `http://` und `https://127.0.0.1` werden abgewiesen; Zettel mit Schnellknöpfen und „Ganzen Zettel teilen“; keine Seitenfehler in der Konsole.
