/** Wo eingekauft wird. Jede Zutat hat einen Standard-Laden, änderbar im Katalog. */
export type Laden = 'markt' | 'aldi' | 'edeka'

export const LAEDEN: { id: Laden; name: string; hinweis: string }[] = [
  { id: 'markt', name: 'Wochenmarkt', hinweis: 'Samstag: Obst, Gemüse, Brot, Käse, Eier' },
  { id: 'aldi', name: 'Aldi', hinweis: 'Grundlebensmittel, Milchprodukte, Tiefkühl' },
  { id: 'edeka', name: 'Edeka', hinweis: 'Nur was es woanders nicht gibt' },
]

/** Abteilung bestimmt die Reihenfolge auf der Einkaufsliste (Stand bzw. Gang). */
export type Abteilung =
  | 'gemuese' | 'obst' | 'brot' | 'kaese' | 'eier' | 'milch' | 'fleisch' | 'fisch'
  | 'tk' | 'trocken' | 'konserve' | 'gewuerz' | 'sonstiges'

export const ABTEILUNGEN: Record<Abteilung, string> = {
  gemuese: 'Gemüse',
  obst: 'Obst',
  brot: 'Brot & Backwaren',
  kaese: 'Käse',
  eier: 'Eier',
  milch: 'Milch & Kühlregal',
  fleisch: 'Fleisch & Wurst',
  fisch: 'Fisch',
  tk: 'Tiefkühl',
  trocken: 'Nudeln, Reis & Trockenes',
  konserve: 'Dosen & Gläser',
  gewuerz: 'Öl & Gewürze',
  sonstiges: 'Sonstiges',
}

/**
 * Wie lange eine Zutat nach dem Samstagseinkauf hält. Danach richtet sich, an welchem
 * Tag ein Gericht gut liegt: Empfindliches an den Anfang der Woche.
 */
export type Haltbarkeit = 'kurz' | 'mittel' | 'lang'

export interface ZutatInfo {
  name: string
  laden: Laden
  abteilung: Abteilung
  haltbarkeit: Haltbarkeit
  /**
   * Monate (1–12) mit regionaler Saison. Fehlt das Feld, spielt Saison keine Rolle
   * (Nudeln, Käse …). Ein leeres Feld heißt: nie regional (Banane, Zitrone).
   */
  saison?: number[]
  /** Grundvorrat (Öl, Salz, Gewürze): kommt nur auf die Liste, wenn er leer ist. */
  vorrat?: boolean
  /** Symbol für Listen; fehlt es, steht das der Abteilung da. */
  bild?: string
  /**
   * Grober Preis in Euro je Einheit, so wie die Zutat in Rezepten vorkommt: bei g je
   * Kilogramm, bei ml je Liter, sonst je Stück, Dose, Bund … Ein Schätzwert, kein Kassenbon.
   */
  preis?: Partial<Record<Einheit, number>>
}

export type Einheit =
  | 'g' | 'ml' | 'Stück' | 'EL' | 'TL' | 'Zehe' | 'Dose' | 'Glas' | 'Packung' | 'Bund' | 'Prise'

export const EINHEITEN: Einheit[] = [
  'g', 'ml', 'Stück', 'EL', 'TL', 'Zehe', 'Dose', 'Glas', 'Packung', 'Bund', 'Prise',
]

export interface RezeptZutat {
  name: string
  menge: number
  einheit: Einheit
}

/** Kategorie eines Gerichts, passend zu den Feldern des Wochenrasters. */
export type Kategorie =
  | 'nudeln' | 'huelsenfruechte' | 'fisch' | 'ofen' | 'gemuese' | 'besonders'

export const KATEGORIEN: Record<Kategorie, string> = {
  nudeln: 'Nudeln',
  huelsenfruechte: 'Hülsenfrüchte',
  fisch: 'Fisch',
  ofen: 'Ofen & Blech',
  gemuese: 'Gemüse & Kartoffeln',
  besonders: 'Etwas Besonderes',
}

/**
 * Foto eines Gerichts. Entweder ein frei lizenziertes Bild (Creative Commons) – dann
 * gehören Urheber, Lizenz und Quelle dazu und werden angezeigt – oder ein eigenes Foto im
 * Speicher des Haushalts (`pfad`).
 */
export type Foto =
  | { art: 'frei'; quelle: string; url: string; seite: string; autor: string; lizenz: string }
  | { art: 'eigen'; pfad: string }

export interface Rezept {
  id: string
  name: string
  kategorie: Kategorie
  /** Gesamtzeit in Minuten, inklusive Ofen. */
  minuten: number
  /** Für wie viele normale Portionen die Mengen gelten. */
  portionen: number
  kinderfreundlich: boolean
  zutaten: RezeptZutat[]
  anleitung: string
  foto?: Foto
}

/** Was im Wochenraster an einem Tag vorgesehen ist. */
export type Feld = Kategorie | 'kinderwunsch' | 'frei'

export const FELDER: Record<Feld, string> = {
  ...KATEGORIEN,
  kinderwunsch: 'Wunsch des Kindes',
  frei: 'Freie Wahl',
}

/** Die Woche beginnt mit dem Einkaufstag Samstag. */
export const WOCHENTAGE = ['Samstag', 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']

export type Tag =
  | { typ: 'rezept'; rezeptId: string; mitResten: boolean; fixiert: boolean }
  | { typ: 'restetag' }
  | { typ: 'leer' }

export interface Plan {
  /** ISO-Datum des Samstags, an dem die Woche beginnt. */
  start: string
  tage: Tag[]
}

export interface Grundposten {
  name: string
  menge: number
  einheit: Einheit
}

/** Wer bewertet. Die Id bleibt, der Name lässt sich ändern. */
export interface Person {
  id: string
  name: string
}

/** 3 = lecker, 2 = geht so, 1 = nicht nochmal */
export type Wert = 1 | 2 | 3

export const WERTE: { wert: Wert; zeichen: string; name: string }[] = [
  { wert: 3, zeichen: '😋', name: 'Lecker' },
  { wert: 2, zeichen: '🙂', name: 'Geht so' },
  { wert: 1, zeichen: '😖', name: 'Nicht nochmal' },
]

export interface Bewertung {
  wert: Wert
  /** ISO-Datum der Bewertung */
  datum: string
}

export interface Einstellungen {
  /** Portionen je Abendessen: zwei Erwachsene und ein Kind ≈ 2,5. */
  portionen: number
  /** Zusätzliche Portionen, wenn fürs Mittagessen am nächsten Tag mitgekocht wird. */
  mittagsportionen: number
  personen: Person[]
}

export interface ExtraPosten {
  id: string
  text: string
  laden: Laden
}
