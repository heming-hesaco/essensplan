import { erstelleListe, portionenFuer, type Posten } from './einkauf'
import type { Einheit, Einstellungen, Grundposten, Laden, Plan, Rezept } from './typen'
import { zutatInfo, type Katalog } from './zutaten'

/**
 * Grobe Kosten. Gerechnet wird mit dem, was verbraucht wird – eine angebrochene Packung
 * Nudeln zählt nur zur Hälfte, der Rest steht nächste Woche im Schrank. Grundvorrat
 * (Öl, Gewürze, Mehl) zählt nicht mit: er kostet je Woche Cent-Beträge und wird in
 * ganzen Packungen gekauft, wenn er leer ist.
 */

/** Preis einer Menge, oder null, wenn für diese Zutat in dieser Einheit keiner bekannt ist. */
export function preisFuer(name: string, menge: number, einheit: Einheit, katalog: Katalog): number | null {
  const info = zutatInfo(katalog, name)
  if (info.vorrat) return 0
  const preis = info.preis?.[einheit]
  if (preis === undefined || !(preis >= 0)) return null
  return einheit === 'g' || einheit === 'ml' ? (menge / 1000) * preis : menge * preis
}

export interface Kosten {
  euro: number
  /** Zutaten ohne Preis – die Summe ist dann zu niedrig, und das soll man sehen. */
  ohnePreis: string[]
}

function summe(teile: { name: string; menge: number; einheit: Einheit }[], katalog: Katalog): Kosten {
  let euro = 0
  const ohnePreis: string[] = []
  for (const t of teile) {
    const p = preisFuer(t.name, t.menge, t.einheit, katalog)
    if (p === null) {
      const name = zutatInfo(katalog, t.name).name
      if (!ohnePreis.includes(name)) ohnePreis.push(name)
    } else euro += p
  }
  return { euro, ohnePreis }
}

/** Ein Gericht für den Haushalt, mit oder ohne Reste fürs Mittagessen. */
export function gerichtKosten(rezept: Rezept, katalog: Katalog, einstellungen: Einstellungen, mitResten = false): Kosten {
  const faktor = portionenFuer(mitResten, einstellungen) / rezept.portionen
  return summe(rezept.zutaten.map((z) => ({ ...z, menge: z.menge * faktor })), katalog)
}

export interface Wochenkosten {
  gesamt: Kosten
  /** Nur die Abendessen (samt Resten fürs Mittagessen). */
  abendessen: number
  /** Abende mit einem Gericht – für den Schnitt je Abend. */
  abende: number
  jeLaden: Record<Laden, number>
}

/**
 * Die Woche: alles auf der Einkaufsliste außer Grundvorrat, also Abendessen und
 * Frühstück. Eigene Posten (Spülmittel …) haben keinen Preis und fehlen.
 */
export function wochenKosten(
  plan: Plan,
  rezepte: Rezept[],
  katalog: Katalog,
  einstellungen: Einstellungen,
  fruehstueck: Grundposten[],
): Wochenkosten {
  const posten = erstelleListe(plan, rezepte, katalog, einstellungen, fruehstueck).filter((p) => !p.vorrat)
  const jeLaden: Record<Laden, number> = { markt: 0, aldi: 0, edeka: 0 }
  for (const p of posten) jeLaden[p.laden] += postenPreis(p, katalog) ?? 0
  let abendessen = 0
  let abende = 0
  for (const tag of plan.tage) {
    if (tag.typ !== 'rezept') continue
    const r = rezepte.find((x) => x.id === tag.rezeptId)
    if (!r) continue
    abendessen += gerichtKosten(r, katalog, einstellungen, tag.mitResten).euro
    abende++
  }
  return { gesamt: summe(posten, katalog), abendessen, abende, jeLaden }
}

export function postenPreis(p: Posten, katalog: Katalog): number | null {
  return p.vorrat ? 0 : preisFuer(p.name, p.menge, p.einheit, katalog)
}

/** „ca. 74 €“ für größere Beträge, „ca. 5,40 €“ für kleine – auf 10 Cent gerundet. */
export function zeigeEuro(euro: number): string {
  if (euro >= 20) return `ca. ${Math.round(euro).toLocaleString('de-DE')} €`
  const gerundet = Math.round(euro * 10) / 10
  return `ca. ${gerundet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}
