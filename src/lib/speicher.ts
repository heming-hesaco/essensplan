import { STARTFOTOS } from './startfotos'
import { START_FRUEHSTUECK, STARTREZEPTE } from './startrezepte'
import type {
  Bewertung, Einstellungen, ExtraPosten, Feld, Grundposten, Plan, Rezept, ZutatInfo,
} from './typen'

/** Samstag bis Freitag: Markttag, Sonntag, dann die Werktage. */
export const START_RASTER: Feld[] = [
  'gemuese', 'besonders', 'nudeln', 'huelsenfruechte', 'fisch', 'ofen', 'kinderwunsch',
]

export interface Zustand {
  version: 1
  rezepte: Rezept[]
  /** Eigene oder geänderte Katalogeinträge; gehen dem Startkatalog vor. */
  katalog: ZutatInfo[]
  raster: Feld[]
  einstellungen: Einstellungen
  fruehstueck: Grundposten[]
  /** Pläne je Woche, Schlüssel ist der Samstag. */
  plaene: Record<string, Plan>
  /** Abgehakte Posten je Woche. */
  abgehakt: Record<string, string[]>
  /** Vorratsposten, die in dieser Woche leer sind und gekauft werden müssen. */
  vorratLeer: Record<string, string[]>
  /** Von Hand ergänzte Posten je Woche (Spülmittel, Geburtstagskuchen …). */
  extras: Record<string, ExtraPosten[]>
  /** Bewertungen je Rezept und Person. */
  bewertungen: Record<string, Record<string, Bewertung>>
  /** Wünsche des Kindes: Rezept → seit wann. */
  wuensche: Record<string, string>
}

export const START_PERSONEN = [
  { id: 'p1', name: 'Erwachsene/r 1' },
  { id: 'p2', name: 'Erwachsene/r 2' },
  { id: 'p3', name: 'Kind' },
]

export function startzustand(): Zustand {
  return {
    version: 1,
    rezepte: structuredClone(STARTREZEPTE),
    katalog: [],
    raster: [...START_RASTER],
    einstellungen: { portionen: 2.5, mittagsportionen: 2, personen: structuredClone(START_PERSONEN) },
    fruehstueck: structuredClone(START_FRUEHSTUECK),
    plaene: {},
    abgehakt: {},
    vorratLeer: {},
    extras: {},
    bewertungen: {},
    wuensche: {},
  }
}

const SCHLUESSEL = 'essensplan:v1'

/**
 * Liest den gespeicherten Stand. Der Speicher kann fehlen (privates Fenster) oder
 * Unsinn enthalten; dann startet die App mit den Startdaten, statt nicht zu laden.
 */
export function lade(): Zustand {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (!roh) return startzustand()
    return pruefe(JSON.parse(roh))
  } catch {
    return startzustand()
  }
}

export function speichere(z: Zustand): boolean {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(z))
    return true
  } catch {
    return false
  }
}

/** Ergänzt fehlende Felder mit Startwerten – für Sicherungen aus älteren Fassungen. */
export function pruefe(daten: unknown): Zustand {
  if (!daten || typeof daten !== 'object' || (daten as { version?: unknown }).version !== 1) {
    throw new Error('Das ist keine Sicherung des Essensplans.')
  }
  const d = daten as Partial<Zustand>
  const start = startzustand()
  return {
    version: 1,
    rezepte: Array.isArray(d.rezepte) ? mitStartfotos(d.rezepte) : start.rezepte,
    katalog: Array.isArray(d.katalog) ? d.katalog : [],
    raster: Array.isArray(d.raster) && d.raster.length === 7 ? d.raster : start.raster,
    einstellungen: mitPersonen({ ...start.einstellungen, ...(d.einstellungen ?? {}) }),
    fruehstueck: Array.isArray(d.fruehstueck) ? d.fruehstueck : start.fruehstueck,
    plaene: d.plaene ?? {},
    abgehakt: d.abgehakt ?? {},
    vorratLeer: d.vorratLeer ?? {},
    extras: d.extras ?? {},
    bewertungen: d.bewertungen ?? {},
    wuensche: d.wuensche ?? {},
  }
}

export function neueId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

/** Ältere Stände kennen noch keine Personen. */
export function mitPersonen(e: Einstellungen): Einstellungen {
  return Array.isArray(e.personen) && e.personen.length > 0 ? e : { ...e, personen: structuredClone(START_PERSONEN) }
}

/**
 * Startgerichte aus einer Zeit vor den Fotos bekommen ihr Foto nachgereicht. Ein eigenes
 * Foto bleibt unangetastet.
 */
export function mitStartfotos(rezepte: Rezept[]): Rezept[] {
  return rezepte.map((r) => (r.foto || !STARTFOTOS[r.id] ? r : { ...r, foto: STARTFOTOS[r.id] }))
}
