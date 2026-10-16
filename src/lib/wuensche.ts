import type { Plan, Person } from './typen'
import { plusTage } from './woche'

/** Wünsche des Kindes: Rezept → Datum, seit dem es sich das Gericht wünscht. */
export type Wuensche = Record<string, string>

/** Drei offene Wünsche: genug zum Aussuchen, zu wenig, um die ganze Woche zu bestimmen. */
export const MAX_WUENSCHE = 3

export type WunschStand =
  | { art: 'offen' }
  /** Steht im Plan, heute oder später. */
  | { art: 'geplant'; datum: string }
  /** Wurde seit dem Wunsch gegessen – der Wunsch ist erfüllt und fällt weg. */
  | { art: 'erfuellt'; datum: string }

/**
 * Ob ein Wunsch erfüllt ist, wird aus den Plänen abgelesen, nicht gespeichert: Steht das
 * Gericht an einem Tag ab dem Wunsch im Plan, kommt es; liegt der Tag vor heute, gab es
 * es schon. Wünscht sich das Kind dasselbe Gericht später noch einmal, beginnt der Wunsch
 * mit dem neuen Datum von vorn.
 */
export function wunschStand(rezeptId: string, seit: string, plaene: Record<string, Plan>, heute: string): WunschStand {
  let geplant: string | null = null
  let erfuellt: string | null = null
  for (const plan of Object.values(plaene)) {
    plan.tage.forEach((t, i) => {
      if (t.typ !== 'rezept' || t.rezeptId !== rezeptId) return
      const datum = plusTage(plan.start, i)
      if (datum < seit) return
      if (datum < heute) {
        if (!erfuellt || datum > erfuellt) erfuellt = datum
      } else if (!geplant || datum < geplant) geplant = datum
    })
  }
  if (geplant) return { art: 'geplant', datum: geplant }
  if (erfuellt) return { art: 'erfuellt', datum: erfuellt }
  return { art: 'offen' }
}

/** Wünsche, die noch gelten (offen oder schon eingeplant), mit ihrem Stand. */
export function aktuelleWuensche(w: Wuensche, plaene: Record<string, Plan>, heute: string): Map<string, WunschStand> {
  const ergebnis = new Map<string, WunschStand>()
  for (const [rezeptId, seit] of Object.entries(w)) {
    const stand = wunschStand(rezeptId, seit, plaene, heute)
    if (stand.art !== 'erfuellt') ergebnis.set(rezeptId, stand)
  }
  return ergebnis
}

/** Setzt oder nimmt einen Wunsch zurück. */
export function wuensche(w: Wuensche, rezeptId: string, an: boolean, heute: string): Wuensche {
  const neu = { ...w }
  if (an) neu[rezeptId] = heute
  else delete neu[rezeptId]
  return neu
}

/** Wer das Kind ist: die dritte Person der Startbesetzung, sonst die letzte. */
export function kindAus(personen: Person[]): Person | null {
  return personen.find((p) => p.id === 'p3') ?? personen[personen.length - 1] ?? null
}
