import type { Abteilung, Haltbarkeit, Laden, ZutatInfo } from './typen'

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

/** Schlüssel für Vergleiche: Groß-/Kleinschreibung und Leerzeichen spielen keine Rolle. */
export function zutatSchluessel(name: string): string {
  return name.trim().toLocaleLowerCase('de-DE').replace(/\s+/g, ' ')
}

export type Katalog = Map<string, ZutatInfo>

/** Startkatalog plus eigene Einträge; ein eigener Eintrag ersetzt den gleichnamigen. */
export function baueKatalog(eigene: ZutatInfo[]): Katalog {
  const katalog: Katalog = new Map()
  for (const info of [...STARTKATALOG, ...eigene]) katalog.set(zutatSchluessel(info.name), info)
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
