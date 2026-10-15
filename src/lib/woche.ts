/**
 * Datumsrechnung auf ISO-Zeichenketten (JJJJ-MM-TT), nie über lokale Date-Objekte –
 * sonst verschiebt die Zeitzone den Tag um Mitternacht.
 */

export function heuteIso(jetzt: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(jetzt)
}

function alsUtc(iso: string): Date {
  const [j, m, t] = iso.split('-').map(Number)
  return new Date(Date.UTC(j, m - 1, t))
}

export function plusTage(iso: string, tage: number): string {
  const d = alsUtc(iso)
  d.setUTCDate(d.getUTCDate() + tage)
  return d.toISOString().slice(0, 10)
}

/** 0 = Sonntag … 6 = Samstag */
export function wochentag(iso: string): number {
  return alsUtc(iso).getUTCDay()
}

/** Der Samstag, mit dem die laufende Woche begonnen hat (heute, falls Samstag). */
export function letzterSamstag(iso: string): string {
  return plusTage(iso, -((wochentag(iso) + 1) % 7))
}

/** Der nächste Einkaufssamstag: heute, falls Samstag, sonst der kommende. */
export function naechsterSamstag(iso: string): string {
  return plusTage(iso, (6 - wochentag(iso) + 7) % 7)
}

export function monatVon(iso: string): number {
  return Number(iso.slice(5, 7))
}

const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function kurzDatum(iso: string): string {
  return `${KURZ[wochentag(iso)]}, ${iso.slice(8, 10)}.${iso.slice(5, 7)}.`
}
