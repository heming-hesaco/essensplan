import { bewertungsPunkte, type Bewertungen } from './bewertung'
import type { Feld, Plan, Rezept, Tag } from './typen'
import { zutatInfo, zutatSchluessel, type Katalog } from './zutaten'

export interface PlanKontext {
  rezepte: Rezept[]
  katalog: Katalog
  /** Ein Feld je Wochentag, Samstag zuerst. */
  raster: Feld[]
  /** Monat des Einkaufs (1–12), für die Saison. */
  monat: number
  /** Gerichte der letzten beiden Wochen – sie kommen nur, wenn nichts anderes passt. */
  kuerzlich: Set<string>
  /** Zufallsquelle 0–1; in Tests fest, damit Vorschläge nachvollziehbar sind. */
  zufall: () => number
  /** Eure Bewertungen: Lieblinge kommen öfter, „nicht nochmal“ fast nie. */
  bewertungen?: Bewertungen
  /** Gerichte, die sich das Kind wünscht: Sie kommen bevorzugt, am Kinderwunsch-Tag zuerst. */
  wuensche?: Set<string>
}

const FISCH = /fisch|lachs|thunfisch|seelachs/i

export interface Merkmale {
  /** Anteil der saisonabhängigen Zutaten, die gerade Saison haben; null = keine solchen. */
  saisonAnteil: number | null
  /** Enthält etwas, das nach dem Samstagseinkauf nur wenige Tage hält. */
  empfindlich: boolean
  /** Frische Zutaten mit Saison (Kürbis, Lauch …), die sich Gerichte teilen können. */
  teilbar: string[]
  fleisch: boolean
  fisch: boolean
}

export function merkmale(rezept: Rezept, katalog: Katalog, monat: number): Merkmale {
  let mitSaison = 0
  let inSaison = 0
  let empfindlich = false
  let fleisch = false
  let fisch = rezept.kategorie === 'fisch'
  const teilbar: string[] = []
  for (const z of rezept.zutaten) {
    const info = zutatInfo(katalog, z.name)
    if (info.saison && info.saison.length < 12) {
      mitSaison++
      if (info.saison.includes(monat)) inSaison++
      if (info.saison.length > 0) teilbar.push(zutatSchluessel(z.name))
    }
    if (info.haltbarkeit === 'kurz') empfindlich = true
    if (info.abteilung === 'fleisch') fleisch = true
    if (FISCH.test(z.name)) fisch = true
  }
  return {
    saisonAnteil: mitSaison === 0 ? null : inSaison / mitSaison,
    empfindlich,
    teilbar,
    fleisch,
    fisch,
  }
}

export function passtInsFeld(rezept: Rezept, feld: Feld): boolean {
  if (feld === 'frei') return true
  if (feld === 'kinderwunsch') return rezept.kinderfreundlich
  return rezept.kategorie === feld
}

/**
 * Punkte für ein Gericht an einem Tag. Höher ist besser.
 * - Saison: bis zu +3, wenn alle Saisonzutaten gerade Saison haben.
 * - Gemeinsame Zutaten mit den schon gewählten Gerichten: +1 je Zutat, höchstens +3
 *   (der halbe Kürbis vom Montag landet am Donnerstag auf dem Blech).
 * - Empfindliches gehört an den Wochenanfang: +1,8 am Samstag, je Tag 0,6 weniger,
 *   −1,8 am Freitag. Nur ein Abzug für späte Tage reichte nicht: am Samstag wäre es
 *   dann gleichauf, und das Haltbare käme zuerst dran.
 * - In den letzten zwei Wochen gegessen: −6.
 * - Bewertungen: je „lecker“ +0,8, je „nicht nochmal“ −8.
 * - Wunsch des Kindes: +4 – genug, um sich an seinem Kategorietag durchzusetzen, aber
 *   nicht gegen ein „nicht nochmal“ der anderen.
 * - Zufall bis +2, damit die Woche nicht jedes Mal gleich aussieht.
 */
export function bewerte(rezept: Rezept, tagIndex: number, gewaehlt: Rezept[], ctx: PlanKontext): number {
  const m = merkmale(rezept, ctx.katalog, ctx.monat)
  let punkte = 0
  if (m.saisonAnteil !== null) punkte += 3 * m.saisonAnteil
  const vorhanden = new Set(gewaehlt.flatMap((g) => merkmale(g, ctx.katalog, ctx.monat).teilbar))
  punkte += Math.min(3, m.teilbar.filter((t) => vorhanden.has(t)).length)
  if (m.empfindlich) punkte += 0.6 * (3 - tagIndex)
  if (ctx.kuerzlich.has(rezept.id)) punkte -= 6
  if (ctx.bewertungen) punkte += bewertungsPunkte(rezept.id, ctx.bewertungen)
  if (ctx.wuensche?.has(rezept.id)) punkte += 4
  punkte += ctx.zufall() * 2
  return punkte
}

function besteWahl(
  feld: Feld,
  tagIndex: number,
  gewaehlt: Rezept[],
  ausgeschlossen: Set<string>,
  ctx: PlanKontext,
): Rezept | null {
  const frei = ctx.rezepte.filter((r) => !ausgeschlossen.has(r.id))
  let kandidaten = frei.filter((r) => passtInsFeld(r, feld))
  // Gibt es für ein Feld nichts mehr, lieber irgendein Gericht als ein leerer Tag.
  if (kandidaten.length === 0) kandidaten = frei
  // Am Kinderwunsch-Tag zählt erst der Wunsch, dann alles andere.
  if (feld === 'kinderwunsch' && ctx.wuensche) {
    const gewuenscht = frei.filter((r) => ctx.wuensche!.has(r.id))
    if (gewuenscht.length > 0) kandidaten = gewuenscht
  }
  let beste: Rezept | null = null
  let bestePunkte = -Infinity
  for (const r of kandidaten) {
    const p = bewerte(r, tagIndex, gewaehlt, ctx)
    if (p > bestePunkte) {
      beste = r
      bestePunkte = p
    }
  }
  return beste
}

function rezeptVon(tag: Tag, rezepte: Rezept[]): Rezept | undefined {
  return tag.typ === 'rezept' ? rezepte.find((r) => r.id === tag.rezeptId) : undefined
}

/**
 * Schlägt eine Woche vor. Fixierte Tage und Restetage bleiben stehen; alle übrigen
 * werden neu besetzt, Samstag zuerst. Kein Gericht kommt zweimal in einer Woche vor.
 */
export function schlageWocheVor(start: string, bisher: Plan | null, ctx: PlanKontext): Plan {
  const alt = bisher?.tage ?? []
  const bleibt = (t: Tag | undefined) =>
    t !== undefined && (t.typ === 'restetag' || (t.typ === 'rezept' && t.fixiert))

  const tage: Tag[] = Array.from({ length: 7 }, (_, i) => (bleibt(alt[i]) ? alt[i] : { typ: 'leer' }))
  const gewaehlt = tage.map((t) => rezeptVon(t, ctx.rezepte)).filter((r): r is Rezept => !!r)
  const belegt = new Set(gewaehlt.map((r) => r.id))

  for (let i = 0; i < 7; i++) {
    if (tage[i].typ !== 'leer') continue
    const wahl = besteWahl(ctx.raster[i] ?? 'frei', i, gewaehlt, belegt, ctx)
    if (!wahl) continue
    const vorher = alt[i]
    const mitResten = vorher?.typ === 'rezept' ? vorher.mitResten : true
    tage[i] = { typ: 'rezept', rezeptId: wahl.id, mitResten, fixiert: false }
    gewaehlt.push(wahl)
    belegt.add(wahl.id)
  }
  return { start, tage }
}

/** Ersetzt das Gericht eines Tages durch den nächstbesten Vorschlag für dasselbe Feld. */
export function tauscheTag(plan: Plan, tagIndex: number, ctx: PlanKontext): Plan {
  const tag = plan.tage[tagIndex]
  const andere = plan.tage
    .filter((_, i) => i !== tagIndex)
    .map((t) => rezeptVon(t, ctx.rezepte))
    .filter((r): r is Rezept => !!r)
  const ausgeschlossen = new Set(andere.map((r) => r.id))
  if (tag.typ === 'rezept') ausgeschlossen.add(tag.rezeptId)
  const wahl = besteWahl(ctx.raster[tagIndex] ?? 'frei', tagIndex, andere, ausgeschlossen, ctx)
  if (!wahl) return plan
  const tage = [...plan.tage]
  tage[tagIndex] = {
    typ: 'rezept',
    rezeptId: wahl.id,
    mitResten: tag.typ === 'rezept' ? tag.mitResten : true,
    fixiert: false,
  }
  return { ...plan, tage }
}

export interface Ueberblick {
  gerichte: number
  fleisch: number
  fisch: number
  vegetarisch: number
  /** Anteil der Saisonzutaten der Woche, die gerade Saison haben (0–1), oder null. */
  saisonAnteil: number | null
  /** Saisonzutaten, die in mehr als einem Gericht vorkommen. */
  gemeinsam: { name: string; anzahl: number }[]
}

export function ueberblick(plan: Plan, rezepte: Rezept[], katalog: Katalog, monat: number): Ueberblick {
  const gerichte = plan.tage.map((t) => rezeptVon(t, rezepte)).filter((r): r is Rezept => !!r)
  let fleisch = 0
  let fisch = 0
  let summe = 0
  let gezaehlt = 0
  const zaehler = new Map<string, { name: string; anzahl: number }>()
  for (const r of gerichte) {
    const m = merkmale(r, katalog, monat)
    if (m.fisch) fisch++
    else if (m.fleisch) fleisch++
    if (m.saisonAnteil !== null) {
      summe += m.saisonAnteil
      gezaehlt++
    }
    for (const z of r.zutaten) {
      const key = zutatSchluessel(z.name)
      if (!m.teilbar.includes(key)) continue
      const e = zaehler.get(key) ?? { name: zutatInfo(katalog, z.name).name, anzahl: 0 }
      e.anzahl++
      zaehler.set(key, e)
    }
  }
  return {
    gerichte: gerichte.length,
    fleisch,
    fisch,
    vegetarisch: gerichte.length - fleisch - fisch,
    saisonAnteil: gezaehlt === 0 ? null : summe / gezaehlt,
    gemeinsam: [...zaehler.values()].filter((e) => e.anzahl > 1).sort((a, b) => b.anzahl - a.anzahl),
  }
}

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
export function zufallAus(saat: number): () => number {
  let a = saat >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
