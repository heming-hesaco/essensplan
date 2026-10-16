import type { Bewertung, Wert } from './typen'

export type Bewertungen = Record<string, Record<string, Bewertung>>

/**
 * Wie stark eine Bewertung den Wochenvorschlag schiebt. „Nicht nochmal“ wiegt stärker
 * als alles, was ein Gericht sonst an Punkten sammeln kann (Saison, gemeinsame Zutaten,
 * Zufall zusammen höchstens +8): es kommt nur noch, wenn für den Tag nichts anderes passt.
 * −2,5 reichte nicht – der Test mit dem abgelehnten Fischgericht hat es gezeigt.
 */
const GEWICHT: Record<Wert, number> = { 3: 0.8, 2: 0, 1: -8 }

export function bewertungsPunkte(rezeptId: string, b: Bewertungen): number {
  return Object.values(b[rezeptId] ?? {}).reduce((summe, x) => summe + GEWICHT[x.wert], 0)
}

export interface Zusammenfassung {
  lecker: number
  geht: number
  nicht: number
}

export function zusammenfassung(rezeptId: string, b: Bewertungen): Zusammenfassung {
  const z = { lecker: 0, geht: 0, nicht: 0 }
  for (const x of Object.values(b[rezeptId] ?? {})) {
    if (x.wert === 3) z.lecker++
    else if (x.wert === 2) z.geht++
    else z.nicht++
  }
  return z
}

/** Mindestens zwei finden es lecker, keiner lehnt es ab. */
export function istLiebling(rezeptId: string, b: Bewertungen): boolean {
  const z = zusammenfassung(rezeptId, b)
  return z.lecker >= 2 && z.nicht === 0
}

/** Setzt oder entfernt (wert = null) die Bewertung einer Person. */
export function bewerte(b: Bewertungen, rezeptId: string, person: string, wert: Wert | null, datum: string): Bewertungen {
  const fuerRezept = { ...(b[rezeptId] ?? {}) }
  if (wert === null) delete fuerRezept[person]
  else fuerRezept[person] = { wert, datum }
  const neu = { ...b, [rezeptId]: fuerRezept }
  if (Object.keys(fuerRezept).length === 0) delete neu[rezeptId]
  return neu
}
