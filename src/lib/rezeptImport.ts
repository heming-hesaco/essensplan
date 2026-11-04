import type { ImportRezept } from '../../api/_rezeptAusHtml'
import type { Rezept } from './typen'
import { zerlegeZutaten } from './zutatZeile'
import type { Katalog } from './zutaten'

export type { ImportRezept }

/**
 * Macht aus einem übernommenen Rezept ein eigenes. Kein Foto – das gehört der fremden Seite;
 * die Quelle bleibt als Link am Rezept. `unsicher` nennt die Zutatenzeilen, die sich nicht
 * zerlegen ließen und im Formular geprüft werden sollten.
 */
export function alsRezept(imp: ImportRezept, katalog: Katalog, id: string): { rezept: Rezept; unsicher: number[] } {
  const zeilen = imp.zutaten.flatMap((z) => zerlegeZutaten(z, katalog))
  const unsicher = zeilen.flatMap((z, i) => (z.sicher ? [] : [i]))
  const zutaten = zeilen.map(({ name, menge, einheit }) => ({ name, menge, einheit }))
  return {
    rezept: {
      id,
      name: imp.name,
      kategorie: 'gemuese',
      minuten: imp.minuten ?? 30,
      portionen: imp.portionen ?? 4,
      kinderfreundlich: false,
      zutaten: zutaten.length > 0 ? zutaten : [{ name: '', menge: 1, einheit: 'Stück' }],
      anleitung: imp.anleitung,
      quelle: imp.quelle,
    },
    unsicher,
  }
}

/** Fragt die Server-Funktion; liefert das Rezept oder einen Satz, den man anzeigen kann. */
export async function holeImport(link: string): Promise<{ ok: true; rezept: ImportRezept } | { ok: false; fehler: string }> {
  try {
    const antwort = await fetch(`/api/rezept-import?url=${encodeURIComponent(link.trim())}`)
    const daten = await antwort.json().catch(() => null)
    if (antwort.ok && daten?.name) return { ok: true, rezept: daten as ImportRezept }
    return { ok: false, fehler: daten?.fehler ?? 'Seite nicht erreichbar' }
  } catch {
    return { ok: false, fehler: 'Keine Verbindung – bitte später noch einmal versuchen.' }
  }
}
