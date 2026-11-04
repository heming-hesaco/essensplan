import { START_RASTER, type Zustand } from './speicher'
import { STARTREZEPTE } from './startrezepte'
import { ALTE_STARTREZEPTE } from './startrezepteAlt'
import type { Feld, Rezept } from './typen'

/**
 * Prüfwert eines Rezepts (FNV-1a, 32 Bit): gleich, solange niemand Name, Kategorie, Zeit,
 * Portionen, Kinderfreundlichkeit, Zutaten oder Anleitung geändert hat. Das Foto zählt nicht –
 * ein eigenes Foto macht aus einem Startgericht noch kein eigenes Rezept.
 */
export function pruefwert(r: Rezept): string {
  // Zutaten als Tripel: aus der Datenbank (jsonb) kommen die Schlüssel umsortiert zurück.
  const zutaten = r.zutaten.map((z) => [z.name, z.menge, z.einheit])
  const text = JSON.stringify([r.name, r.kategorie, r.minuten, r.portionen, r.kinderfreundlich, zutaten, r.anleitung])
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Fassung des Grundstocks: 2 seit 11/2026 (Hausmannskost, Eintöpfe, Brotzeit, wenig Nudeln). */
export const GRUNDSTOCK = 2

/** Das Vorgaberaster des ersten Grundstocks – wer es nie geändert hat, bekommt das neue. */
export const ALTES_RASTER: Feld[] = ['gemuese', 'besonders', 'nudeln', 'huelsenfruechte', 'fisch', 'ofen', 'kinderwunsch']

/**
 * Stellt einen Haushalt einmal auf den neuen Grundstock um. Was der Haushalt an einem alten
 * Startgericht geändert hat, bleibt unangetastet; unveränderte alte Startgerichte werden
 * durch die neue Fassung ersetzt oder, wenn es sie nicht mehr gibt, aussortiert – nicht
 * gelöscht, damit alte Pläne ihren Namen behalten. Läuft auf beiden Handys zum selben
 * Ergebnis; ein zweiter Lauf ändert nichts.
 */
export function stelleGrundstockUm(z: Zustand): Zustand {
  if ((z.einstellungen.grundstock ?? 1) >= GRUNDSTOCK) return z
  const neueFassung = new Map(STARTREZEPTE.map((r) => [r.id, r]))
  const unveraendert = (r: Rezept) => ALTE_STARTREZEPTE[r.id] !== undefined && ALTE_STARTREZEPTE[r.id] === pruefwert(r)
  const rezepte = z.rezepte.map((r) => {
    if (!unveraendert(r)) return r
    const neu = neueFassung.get(r.id)
    if (!neu) return { ...r, archiviert: true }
    return r.foto?.art === 'eigen' ? { ...neu, foto: r.foto } : neu
  })
  const vorhanden = new Set(rezepte.map((r) => r.id))
  for (const r of STARTREZEPTE) if (!vorhanden.has(r.id)) rezepte.push(r)
  const altesRaster = z.raster.length === ALTES_RASTER.length && z.raster.every((f, i) => f === ALTES_RASTER[i])
  return {
    ...z,
    rezepte,
    raster: altesRaster ? [...START_RASTER] : z.raster,
    einstellungen: { ...z.einstellungen, grundstock: GRUNDSTOCK },
  }
}
