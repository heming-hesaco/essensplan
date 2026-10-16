import type { Abteilung, Einheit, Haltbarkeit, Laden, ZutatInfo } from './typen'

const GANZJAHR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const NIE: number[] = []

function z(
  name: string,
  laden: Laden,
  abteilung: Abteilung,
  haltbarkeit: Haltbarkeit,
  saison?: number[],
): ZutatInfo {
  return { name, laden, abteilung, haltbarkeit, ...(saison ? { saison } : {}) }
}

function vorrat(name: string): ZutatInfo {
  return { name, laden: 'aldi', abteilung: 'gewuerz', haltbarkeit: 'lang', vorrat: true }
}

/**
 * Startkatalog. Die Saisonmonate folgen gängigen Saisonkalendern für Deutschland
 * (Freiland und Lagerware). Laden und Abteilung sind ein Vorschlag; was ihr ändert,
 * steht im eigenen Katalog und geht vor.
 */
export const STARTKATALOG: ZutatInfo[] = [
  // Wochenmarkt: Gemüse
  z('Kartoffeln', 'markt', 'gemuese', 'lang', GANZJAHR),
  z('Möhren', 'markt', 'gemuese', 'lang', GANZJAHR),
  z('Zwiebeln', 'markt', 'gemuese', 'lang', GANZJAHR),
  z('Knoblauch', 'markt', 'gemuese', 'lang', GANZJAHR),
  z('Hokkaido-Kürbis', 'markt', 'gemuese', 'lang', [8, 9, 10, 11, 12]),
  z('Lauch', 'markt', 'gemuese', 'mittel', [1, 2, 3, 4, 7, 8, 9, 10, 11, 12]),
  z('Brokkoli', 'markt', 'gemuese', 'kurz', [6, 7, 8, 9, 10]),
  z('Zucchini', 'markt', 'gemuese', 'mittel', [6, 7, 8, 9, 10]),
  z('Paprika', 'markt', 'gemuese', 'mittel', [7, 8, 9, 10]),
  z('Tomaten', 'markt', 'gemuese', 'mittel', [6, 7, 8, 9, 10]),
  z('Kirschtomaten', 'markt', 'gemuese', 'mittel', [6, 7, 8, 9, 10]),
  z('Gurke', 'markt', 'gemuese', 'mittel', [5, 6, 7, 8, 9]),
  z('Kopfsalat', 'markt', 'gemuese', 'kurz', [5, 6, 7, 8, 9, 10]),
  z('Rote Bete', 'markt', 'gemuese', 'lang', [1, 2, 3, 7, 8, 9, 10, 11, 12]),
  z('Pastinaken', 'markt', 'gemuese', 'lang', [1, 2, 3, 10, 11, 12]),
  z('Spitzkohl', 'markt', 'gemuese', 'mittel', [5, 6, 7, 8, 9, 10, 11]),
  z('Wirsing', 'markt', 'gemuese', 'mittel', [1, 2, 3, 6, 7, 8, 9, 10, 11, 12]),
  z('Kohlrabi', 'markt', 'gemuese', 'mittel', [5, 6, 7, 8, 9, 10]),
  z('Champignons', 'markt', 'gemuese', 'kurz', GANZJAHR),
  z('Süßkartoffeln', 'markt', 'gemuese', 'lang', NIE),
  z('Petersilie', 'markt', 'gemuese', 'kurz', [4, 5, 6, 7, 8, 9, 10]),
  // Wochenmarkt: Obst
  z('Äpfel', 'markt', 'obst', 'lang', [1, 2, 3, 4, 8, 9, 10, 11, 12]),
  z('Birnen', 'markt', 'obst', 'mittel', [8, 9, 10, 11, 12]),
  z('Bananen', 'markt', 'obst', 'mittel', NIE),
  z('Zitrone', 'markt', 'obst', 'lang', NIE),
  // Wochenmarkt: Brot, Käse, Eier
  z('Bauernbrot', 'markt', 'brot', 'mittel'),
  z('Baguette', 'markt', 'brot', 'kurz'),
  z('Bergkäse', 'markt', 'kaese', 'lang'),
  z('Gouda', 'markt', 'kaese', 'lang'),
  z('Eier', 'markt', 'eier', 'lang'),
  // Aldi: Kühlregal
  z('Milch', 'aldi', 'milch', 'lang'),
  z('Butter', 'aldi', 'milch', 'lang'),
  z('Sahne', 'aldi', 'milch', 'lang'),
  z('Schmand', 'aldi', 'milch', 'lang'),
  z('Joghurt', 'aldi', 'milch', 'mittel'),
  z('Feta', 'aldi', 'milch', 'lang'),
  z('Mozzarella', 'aldi', 'milch', 'mittel'),
  z('Parmesan', 'aldi', 'milch', 'lang'),
  z('Reibekäse', 'aldi', 'milch', 'lang'),
  z('Tortilla-Wraps', 'aldi', 'brot', 'lang'),
  z('Burgerbrötchen', 'aldi', 'brot', 'mittel'),
  // Aldi: Fleisch und Wurst
  z('Rinderhack', 'aldi', 'fleisch', 'kurz'),
  z('Hähnchenbrustfilet', 'aldi', 'fleisch', 'kurz'),
  z('Hähnchenschenkel', 'aldi', 'fleisch', 'kurz'),
  z('Kochschinken', 'aldi', 'fleisch', 'mittel'),
  z('Wiener Würstchen', 'aldi', 'fleisch', 'lang'),
  // Aldi: Tiefkühl
  z('Fischstäbchen', 'aldi', 'tk', 'lang'),
  z('Lachsfilet (TK)', 'aldi', 'tk', 'lang'),
  z('Seelachsfilet (TK)', 'aldi', 'tk', 'lang'),
  z('Erbsen (TK)', 'aldi', 'tk', 'lang'),
  z('Blattspinat (TK)', 'aldi', 'tk', 'lang'),
  // Aldi: Trockenes
  z('Spaghetti', 'aldi', 'trocken', 'lang'),
  z('Vollkornspaghetti', 'aldi', 'trocken', 'lang'),
  z('Penne', 'aldi', 'trocken', 'lang'),
  z('Fusilli', 'aldi', 'trocken', 'lang'),
  z('Makkaroni', 'aldi', 'trocken', 'lang'),
  z('Tagliatelle', 'aldi', 'trocken', 'lang'),
  z('Lasagneplatten', 'aldi', 'trocken', 'lang'),
  z('Kleine Suppennudeln', 'aldi', 'trocken', 'lang'),
  z('Reis', 'aldi', 'trocken', 'lang'),
  z('Rote Linsen', 'aldi', 'trocken', 'lang'),
  z('Tellerlinsen', 'aldi', 'trocken', 'lang'),
  z('Haferflocken', 'aldi', 'trocken', 'lang'),
  // Aldi: Dosen und Gläser
  z('Passierte Tomaten', 'aldi', 'konserve', 'lang'),
  z('Gehackte Tomaten', 'aldi', 'konserve', 'lang'),
  z('Kidneybohnen', 'aldi', 'konserve', 'lang'),
  z('Kichererbsen', 'aldi', 'konserve', 'lang'),
  z('Mais', 'aldi', 'konserve', 'lang'),
  z('Kokosmilch', 'aldi', 'konserve', 'lang'),
  z('Thunfisch', 'aldi', 'konserve', 'lang'),
  z('Pesto', 'aldi', 'konserve', 'lang'),
  z('Apfelmus', 'aldi', 'konserve', 'lang'),
  // Edeka: Besonderes
  z('Mie-Nudeln', 'edeka', 'trocken', 'lang'),
  z('Frischer Salbei', 'edeka', 'gemuese', 'kurz'),
  // Grundvorrat
  vorrat('Salz'),
  vorrat('Pfeffer'),
  vorrat('Olivenöl'),
  vorrat('Rapsöl'),
  vorrat('Mehl'),
  vorrat('Zucker'),
  vorrat('Gemüsebrühe'),
  vorrat('Tomatenmark'),
  vorrat('Currypulver'),
  vorrat('Paprikapulver'),
  vorrat('Kreuzkümmel'),
  vorrat('Oregano'),
  vorrat('Muskat'),
  vorrat('Sojasauce'),
  vorrat('Trockenhefe'),
  vorrat('Marmelade'),
  vorrat('Honig'),
]

/** Symbole der Zutaten. Was hier fehlt, bekommt das Symbol seiner Abteilung. */
const BILDER: Record<string, string> = {
  Kartoffeln: '🥔', Möhren: '🥕', Zwiebeln: '🧅', Knoblauch: '🧄', 'Hokkaido-Kürbis': '🎃',
  Lauch: '🥬', Brokkoli: '🥦', Zucchini: '🥒', Paprika: '🫑', Tomaten: '🍅', Kirschtomaten: '🍅',
  Gurke: '🥒', Kopfsalat: '🥬', 'Rote Bete': '🟣', Pastinaken: '🥕', Spitzkohl: '🥬', Wirsing: '🥬',
  Kohlrabi: '🥬', Champignons: '🍄', Süßkartoffeln: '🍠', Petersilie: '🌿', Äpfel: '🍎', Birnen: '🍐',
  Bananen: '🍌', Zitrone: '🍋', Bauernbrot: '🍞', Baguette: '🥖', Bergkäse: '🧀', Gouda: '🧀',
  Eier: '🥚', Milch: '🥛', Butter: '🧈', Sahne: '🥛', Schmand: '🥛', Joghurt: '🥛', Feta: '🧀',
  Mozzarella: '🧀', Parmesan: '🧀', Reibekäse: '🧀', 'Tortilla-Wraps': '🫓', Burgerbrötchen: '🍔',
  Rinderhack: '🥩', Hähnchenbrustfilet: '🍗', Hähnchenschenkel: '🍗', Kochschinken: '🥓',
  'Wiener Würstchen': '🌭', Fischstäbchen: '🐟', 'Lachsfilet (TK)': '🐟', 'Seelachsfilet (TK)': '🐟',
  'Erbsen (TK)': '🫛', 'Blattspinat (TK)': '🥬', Spaghetti: '🍝', Vollkornspaghetti: '🍝', Penne: '🍝',
  Fusilli: '🍝', Makkaroni: '🍝', Tagliatelle: '🍝', Lasagneplatten: '🍝', 'Kleine Suppennudeln': '🍝',
  Reis: '🍚', 'Rote Linsen': '🫘', Tellerlinsen: '🫘', Haferflocken: '🥣', 'Passierte Tomaten': '🥫',
  'Gehackte Tomaten': '🥫', Kidneybohnen: '🫘', Kichererbsen: '🫘', Mais: '🌽', Kokosmilch: '🥥',
  Thunfisch: '🐟', Pesto: '🌿', Apfelmus: '🍎', 'Mie-Nudeln': '🍜', 'Frischer Salbei': '🌿',
  Salz: '🧂', Olivenöl: '🫒', Rapsöl: '🫗', Mehl: '🌾', Zucker: '🍬', Honig: '🍯', Marmelade: '🍓',
}

const ABTEILUNG_BILD: Record<Abteilung, string> = {
  gemuese: '🥬', obst: '🍎', brot: '🍞', kaese: '🧀', eier: '🥚', milch: '🥛', fleisch: '🥩', fisch: '🐟',
  tk: '❄️', trocken: '🌾', konserve: '🥫', gewuerz: '🧂', sonstiges: '🛒',
}

/**
 * Grobe Preise, damit die Woche eine Größenordnung bekommt: Discounter-Niveau bei Aldi,
 * etwas darüber auf dem Markt. Geschätzt, nicht abgelesen – unter Einstellungen änderbar.
 * Bei g ist es der Preis je Kilogramm, bei ml je Liter. Grundvorrat hat keinen Preis: er
 * wird selten und dann in ganzen Packungen gekauft.
 */
const PREISE: Record<string, Partial<Record<Einheit, number>>> = {
  Kartoffeln: { g: 1.8 }, Möhren: { g: 1.8, Stück: 0.15 }, Zwiebeln: { Stück: 0.15 },
  Knoblauch: { Zehe: 0.08 }, 'Hokkaido-Kürbis': { g: 2.5 }, Lauch: { Stück: 0.9 },
  Brokkoli: { Stück: 1.8 }, Zucchini: { Stück: 0.9 }, Paprika: { Stück: 0.9 }, Tomaten: { Stück: 0.4 },
  Kirschtomaten: { g: 5 }, Gurke: { Stück: 0.8 }, Kopfsalat: { Stück: 1.3 }, 'Rote Bete': { Stück: 0.4 },
  Pastinaken: { g: 3 }, Spitzkohl: { g: 2 }, Wirsing: { Stück: 2 }, Kohlrabi: { Stück: 0.9 },
  Champignons: { g: 5 }, Süßkartoffeln: { g: 3 }, Petersilie: { Bund: 1.2 },
  Äpfel: { Stück: 0.35 }, Birnen: { Stück: 0.45 }, Bananen: { Stück: 0.25 }, Zitrone: { Stück: 0.4 },
  Bauernbrot: { Stück: 4.5 }, Baguette: { Stück: 1.5 }, Bergkäse: { g: 25 }, Gouda: { g: 14 },
  Eier: { Stück: 0.35 }, Milch: { ml: 1.1 }, Butter: { g: 9 }, Sahne: { ml: 4 }, Schmand: { g: 4 },
  Joghurt: { g: 2.5 }, Feta: { g: 9 }, Mozzarella: { g: 7 }, Parmesan: { g: 20 }, Reibekäse: { g: 9 },
  'Tortilla-Wraps': { Packung: 1.5 }, Burgerbrötchen: { Stück: 0.35 },
  Rinderhack: { g: 10 }, Hähnchenbrustfilet: { g: 11 }, Hähnchenschenkel: { Stück: 1.2 },
  Kochschinken: { g: 12 }, 'Wiener Würstchen': { Stück: 0.45 },
  Fischstäbchen: { g: 7 }, 'Lachsfilet (TK)': { g: 20 }, 'Seelachsfilet (TK)': { g: 11 },
  'Erbsen (TK)': { g: 2.5 }, 'Blattspinat (TK)': { g: 2.5 },
  Spaghetti: { g: 1.6 }, Vollkornspaghetti: { g: 2.2 }, Penne: { g: 1.6 }, Fusilli: { g: 1.6 },
  Makkaroni: { g: 1.6 }, Tagliatelle: { g: 2.4 }, Lasagneplatten: { g: 2.4 }, 'Kleine Suppennudeln': { g: 2.4 },
  Reis: { g: 2.2 }, 'Rote Linsen': { g: 3.5 }, Tellerlinsen: { g: 3 }, Haferflocken: { g: 1.2 },
  'Passierte Tomaten': { g: 1.2 }, 'Gehackte Tomaten': { Dose: 0.7 }, Kidneybohnen: { Dose: 0.8 },
  Kichererbsen: { Dose: 0.8 }, Mais: { Dose: 0.9 }, Kokosmilch: { Dose: 1.3 }, Thunfisch: { Dose: 1.7 },
  Pesto: { Glas: 1.8 }, Apfelmus: { Glas: 1.1 }, 'Mie-Nudeln': { g: 8 }, 'Frischer Salbei': { Bund: 1.5 },
}

for (const info of STARTKATALOG) {
  if (BILDER[info.name]) info.bild = BILDER[info.name]
  if (PREISE[info.name]) info.preis = PREISE[info.name]
}

export function zutatBild(info: ZutatInfo): string {
  return info.bild ?? ABTEILUNG_BILD[info.abteilung]
}

/** Schlüssel für Vergleiche: Groß-/Kleinschreibung und Leerzeichen spielen keine Rolle. */
export function zutatSchluessel(name: string): string {
  return name.trim().toLocaleLowerCase('de-DE').replace(/\s+/g, ' ')
}

export type Katalog = Map<string, ZutatInfo>

/**
 * Startkatalog plus eigene Einträge. Ein eigener Eintrag geht dem gleichnamigen vor, Feld
 * für Feld: wer früher nur den Laden geändert hat, behält so Symbol und Preis des Starts.
 */
export function baueKatalog(eigene: ZutatInfo[]): Katalog {
  const katalog: Katalog = new Map()
  for (const info of STARTKATALOG) katalog.set(zutatSchluessel(info.name), info)
  for (const info of eigene) {
    const key = zutatSchluessel(info.name)
    const start = katalog.get(key)
    katalog.set(key, start ? { ...start, ...info, preis: { ...start.preis, ...info.preis } } : info)
  }
  return katalog
}

/** Unbekannte Zutaten landen bei Edeka unter „Sonstiges“, damit sie auffallen. */
export function zutatInfo(katalog: Katalog, name: string): ZutatInfo {
  return (
    katalog.get(zutatSchluessel(name)) ?? {
      name: name.trim(),
      laden: 'edeka',
      abteilung: 'sonstiges',
      haltbarkeit: 'mittel',
    }
  )
}

export function istInSaison(info: ZutatInfo, monat: number): boolean | null {
  if (!info.saison) return null
  return info.saison.includes(monat)
}
