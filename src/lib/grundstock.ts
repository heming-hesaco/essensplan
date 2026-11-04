import type { Rezept } from './typen'

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
