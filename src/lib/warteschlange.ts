import { zeilenSchluessel, type Vorgang } from './abgleich'

const SCHLUESSEL = 'essensplan:warteschlange'

/**
 * Änderungen, die noch nicht beim Server sind – im Laden ohne Netz die Regel, nicht die
 * Ausnahme. Sie stehen im Gerätespeicher und überstehen damit auch ein Schließen der App.
 * Mehrere Änderungen an derselben Zeile fallen zusammen; es zählt die letzte.
 */
export function ladeWarteschlange(): Vorgang[] {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    return roh ? (JSON.parse(roh) as Vorgang[]) : []
  } catch {
    return []
  }
}

export function speichereWarteschlange(liste: Vorgang[]): void {
  try {
    if (liste.length === 0) localStorage.removeItem(SCHLUESSEL)
    else localStorage.setItem(SCHLUESSEL, JSON.stringify(liste))
  } catch {
    // Ohne Speicher bleibt die Warteschlange nur im Arbeitsspeicher.
  }
}

export function einreihen(liste: Vorgang[], neue: Vorgang[]): Vorgang[] {
  let ergebnis = liste
  for (const v of neue) {
    const k = zeilenSchluessel(v)
    ergebnis = [...ergebnis.filter((x) => zeilenSchluessel(x) !== k), v]
  }
  return ergebnis
}

export function wartetAuf(liste: Vorgang[], v: Vorgang): boolean {
  const k = zeilenSchluessel(v)
  return liste.some((x) => zeilenSchluessel(x) === k)
}
