import { bewerte } from './bewertung'
import { mitPersonen, mitStartfotos, startzustand, type Zustand } from './speicher'
import type { Einstellungen, ExtraPosten, Feld, Grundposten, Laden, Rezept, Tag, Wert, ZutatInfo } from './typen'

/**
 * Eine Änderung, wie sie in die Datenbank geht – und wie sie von dort zurückkommt.
 * Lokale Änderungen und Ereignisse vom anderen Handy haben dieselbe Form, damit es
 * nur einen Weg gibt, sie auf den Zustand anzuwenden.
 */
export type Vorgang =
  | { tabelle: 'haushalte'; einstellungen: Einstellungen; raster: Feld[]; fruehstueck: Grundposten[]; katalog: ZutatInfo[] }
  | { tabelle: 'rezepte'; id: string; rezept: Rezept | null }
  | { tabelle: 'plaene'; woche: string; tage: Tag[] }
  | { tabelle: 'haken'; woche: string; art: 'abgehakt' | 'vorrat_leer'; schluessel: string; an: boolean }
  | { tabelle: 'extras'; woche: string; id: string; text: string; laden: Laden; geloescht: boolean }
  | { tabelle: 'bewertungen'; rezeptId: string; person: string; wert: Wert | null; datum: string }

/** Zwei Vorgänge mit demselben Schlüssel betreffen dieselbe Zeile; der spätere gewinnt. */
export function zeilenSchluessel(v: Vorgang): string {
  switch (v.tabelle) {
    case 'haushalte': return 'haushalte'
    case 'rezepte': return `rezepte:${v.id}`
    case 'plaene': return `plaene:${v.woche}`
    case 'haken': return `haken:${v.woche}:${v.art}:${v.schluessel}`
    case 'extras': return `extras:${v.id}`
    case 'bewertungen': return `bewertungen:${v.rezeptId}:${v.person}`
  }
}

const gleich = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const HAKEN_FELD = { abgehakt: 'abgehakt', vorrat_leer: 'vorratLeer' } as const

/** Was sich zwischen zwei Ständen geändert hat, als einzelne Schreibvorgänge. */
export function aenderungen(alt: Zustand, neu: Zustand): Vorgang[] {
  const v: Vorgang[] = []

  if (
    !gleich(alt.einstellungen, neu.einstellungen) || !gleich(alt.raster, neu.raster) ||
    !gleich(alt.fruehstueck, neu.fruehstueck) || !gleich(alt.katalog, neu.katalog)
  ) {
    v.push({ tabelle: 'haushalte', einstellungen: neu.einstellungen, raster: neu.raster, fruehstueck: neu.fruehstueck, katalog: neu.katalog })
  }

  const altRezepte = new Map(alt.rezepte.map((r) => [r.id, r]))
  const neuRezepte = new Map(neu.rezepte.map((r) => [r.id, r]))
  for (const [id, r] of neuRezepte) if (!gleich(altRezepte.get(id), r)) v.push({ tabelle: 'rezepte', id, rezept: r })
  for (const id of altRezepte.keys()) if (!neuRezepte.has(id)) v.push({ tabelle: 'rezepte', id, rezept: null })

  for (const [woche, plan] of Object.entries(neu.plaene)) {
    if (!gleich(alt.plaene[woche]?.tage, plan.tage)) v.push({ tabelle: 'plaene', woche, tage: plan.tage })
  }

  for (const art of ['abgehakt', 'vorrat_leer'] as const) {
    const feld = HAKEN_FELD[art]
    const wochen = new Set([...Object.keys(alt[feld]), ...Object.keys(neu[feld])])
    for (const woche of wochen) {
      const vorher = new Set(alt[feld][woche] ?? [])
      const nachher = new Set(neu[feld][woche] ?? [])
      for (const s of nachher) if (!vorher.has(s)) v.push({ tabelle: 'haken', woche, art, schluessel: s, an: true })
      for (const s of vorher) if (!nachher.has(s)) v.push({ tabelle: 'haken', woche, art, schluessel: s, an: false })
    }
  }

  const wochen = new Set([...Object.keys(alt.extras), ...Object.keys(neu.extras)])
  for (const woche of wochen) {
    const vorher = new Map((alt.extras[woche] ?? []).map((e) => [e.id, e]))
    const nachher = new Map((neu.extras[woche] ?? []).map((e) => [e.id, e]))
    for (const [id, e] of nachher) {
      if (!gleich(vorher.get(id), e)) v.push({ tabelle: 'extras', woche, id, text: e.text, laden: e.laden, geloescht: false })
    }
    for (const [id, e] of vorher) {
      if (!nachher.has(id)) v.push({ tabelle: 'extras', woche, id, text: e.text, laden: e.laden, geloescht: true })
    }
  }

  const rezeptIds = new Set([...Object.keys(alt.bewertungen), ...Object.keys(neu.bewertungen)])
  for (const rezeptId of rezeptIds) {
    const vorher = alt.bewertungen[rezeptId] ?? {}
    const nachher = neu.bewertungen[rezeptId] ?? {}
    for (const [person, b] of Object.entries(nachher)) {
      if (!gleich(vorher[person], b)) v.push({ tabelle: 'bewertungen', rezeptId, person, wert: b.wert, datum: b.datum })
    }
    for (const [person, b] of Object.entries(vorher)) {
      if (!(person in nachher)) v.push({ tabelle: 'bewertungen', rezeptId, person, wert: null, datum: b.datum })
    }
  }

  return v
}

/** Wendet einen Vorgang auf den Zustand an – für Ereignisse vom anderen Handy. */
export function wendeAn(z: Zustand, v: Vorgang): Zustand {
  switch (v.tabelle) {
    case 'haushalte':
      return { ...z, einstellungen: v.einstellungen, raster: v.raster, fruehstueck: v.fruehstueck, katalog: v.katalog }
    case 'rezepte': {
      const ohne = z.rezepte.filter((r) => r.id !== v.id)
      if (!v.rezept) return { ...z, rezepte: ohne }
      const index = z.rezepte.findIndex((r) => r.id === v.id)
      if (index < 0) return { ...z, rezepte: [...z.rezepte, v.rezept] }
      const rezepte = [...z.rezepte]
      rezepte[index] = v.rezept
      return { ...z, rezepte }
    }
    case 'plaene':
      return { ...z, plaene: { ...z.plaene, [v.woche]: { start: v.woche, tage: v.tage } } }
    case 'haken': {
      const feld = HAKEN_FELD[v.art]
      const menge = new Set(z[feld][v.woche] ?? [])
      if (v.an) menge.add(v.schluessel)
      else menge.delete(v.schluessel)
      return { ...z, [feld]: { ...z[feld], [v.woche]: [...menge] } }
    }
    case 'extras': {
      const liste = (z.extras[v.woche] ?? []).filter((e) => e.id !== v.id)
      const neu: ExtraPosten[] = v.geloescht ? liste : [...liste, { id: v.id, text: v.text, laden: v.laden }]
      return { ...z, extras: { ...z.extras, [v.woche]: neu } }
    }
    case 'bewertungen':
      return { ...z, bewertungen: bewerte(z.bewertungen, v.rezeptId, v.person, v.wert, v.datum) }
  }
}

/** Ein Stand ohne Inhalt: Grundlage, um einen ganzen Zustand hochzuladen. */
export function leererZustand(): Zustand {
  return { ...startzustand(), rezepte: [], katalog: [], fruehstueck: [], raster: [], einstellungen: { portionen: 0, mittagsportionen: 0, personen: [] } }
}

/* ---------- Zeilen der Datenbank ---------- */

export interface Zeilen {
  haushalt: { einstellungen: unknown; raster: unknown; fruehstueck: unknown; katalog: unknown } | null
  rezepte: { id: string; daten: Rezept; geloescht: boolean }[]
  plaene: { woche: string; tage: Tag[] }[]
  haken: { woche: string; art: 'abgehakt' | 'vorrat_leer'; schluessel: string; an: boolean }[]
  extras: { id: string; woche: string; text: string; laden: Laden; geloescht: boolean }[]
  bewertungen: { rezept_id: string; person: string; wert: Wert | null; datum: string }[]
}

/** Der ganze Stand eines Haushalts aus den Zeilen der Datenbank. */
export function ausZeilen(zeilen: Zeilen): Zustand {
  const start = startzustand()
  const h = zeilen.haushalt
  let z: Zustand = {
    ...start,
    einstellungen: mitPersonen({ ...start.einstellungen, ...((h?.einstellungen as Einstellungen) ?? {}) }),
    raster: Array.isArray(h?.raster) && h.raster.length === 7 ? (h.raster as Feld[]) : start.raster,
    fruehstueck: Array.isArray(h?.fruehstueck) ? (h.fruehstueck as Grundposten[]) : start.fruehstueck,
    katalog: Array.isArray(h?.katalog) ? (h.katalog as ZutatInfo[]) : [],
    rezepte: mitStartfotos(zeilen.rezepte.filter((r) => !r.geloescht).map((r) => r.daten)),
  }
  for (const p of zeilen.plaene) z = wendeAn(z, { tabelle: 'plaene', woche: p.woche, tage: p.tage })
  for (const k of zeilen.haken) if (k.an) z = wendeAn(z, { tabelle: 'haken', ...k })
  for (const e of zeilen.extras) if (!e.geloescht) z = wendeAn(z, { tabelle: 'extras', ...e })
  for (const b of zeilen.bewertungen ?? []) {
    if (b.wert !== null) z = wendeAn(z, { tabelle: 'bewertungen', rezeptId: b.rezept_id, person: b.person, wert: b.wert, datum: b.datum })
  }
  return z
}

/** Eine Zeile aus einem Realtime-Ereignis als Vorgang. */
export function zeileZuVorgang(tabelle: string, z: Record<string, unknown>): Vorgang | null {
  switch (tabelle) {
    case 'haushalte':
      if (!z.einstellungen) return null
      return {
        tabelle, einstellungen: z.einstellungen as Einstellungen, raster: z.raster as Feld[],
        fruehstueck: z.fruehstueck as Grundposten[], katalog: z.katalog as ZutatInfo[],
      }
    case 'rezepte':
      return { tabelle, id: z.id as string, rezept: z.geloescht ? null : (z.daten as Rezept) }
    case 'plaene':
      return { tabelle, woche: z.woche as string, tage: z.tage as Tag[] }
    case 'haken':
      return { tabelle, woche: z.woche as string, art: z.art as 'abgehakt' | 'vorrat_leer', schluessel: z.schluessel as string, an: z.an as boolean }
    case 'extras':
      return { tabelle, woche: z.woche as string, id: z.id as string, text: z.text as string, laden: z.laden as Laden, geloescht: z.geloescht as boolean }
    case 'bewertungen':
      return { tabelle, rezeptId: z.rezept_id as string, person: z.person as string, wert: (z.wert as Wert | null) ?? null, datum: z.datum as string }
    default:
      return null
  }
}

/** Ein Vorgang als Zeile für ein Upsert. */
export function vorgangZuZeile(v: Vorgang, haushaltId: string): { tabelle: Vorgang['tabelle']; zeile: Record<string, unknown>; konflikt?: string } {
  switch (v.tabelle) {
    case 'haushalte':
      return { tabelle: 'haushalte', zeile: { einstellungen: v.einstellungen, raster: v.raster, fruehstueck: v.fruehstueck, katalog: v.katalog } }
    case 'rezepte':
      return {
        tabelle: 'rezepte', konflikt: 'haushalt_id,id',
        zeile: v.rezept
          ? { haushalt_id: haushaltId, id: v.id, daten: v.rezept, geloescht: false }
          : { haushalt_id: haushaltId, id: v.id, daten: {}, geloescht: true },
      }
    case 'plaene':
      return { tabelle: 'plaene', konflikt: 'haushalt_id,woche', zeile: { haushalt_id: haushaltId, woche: v.woche, tage: v.tage } }
    case 'haken':
      return {
        tabelle: 'haken', konflikt: 'haushalt_id,woche,art,schluessel',
        zeile: { haushalt_id: haushaltId, woche: v.woche, art: v.art, schluessel: v.schluessel, an: v.an },
      }
    case 'extras':
      return {
        tabelle: 'extras', konflikt: 'haushalt_id,id',
        zeile: { haushalt_id: haushaltId, id: v.id, woche: v.woche, text: v.text, laden: v.laden, geloescht: v.geloescht },
      }
    case 'bewertungen':
      return {
        tabelle: 'bewertungen', konflikt: 'haushalt_id,rezept_id,person',
        zeile: { haushalt_id: haushaltId, rezept_id: v.rezeptId, person: v.person, wert: v.wert, datum: v.datum },
      }
  }
}
