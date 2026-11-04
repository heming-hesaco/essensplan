import { istPrivateAdresse, pruefeAdresse } from './_adresse'
import { rezeptAusHtml, type ImportRezept } from './_rezeptAusHtml'

/** Namensauflösung und Abruf werden übergeben, damit sich der Ablauf ohne Netz prüfen lässt. */
export interface Netz {
  lookup: (host: string) => Promise<{ address: string; family: number }[]>
  fetch: (url: string, init: RequestInit) => Promise<Response>
}

export type Ergebnis = { status: 200; rezept: ImportRezept } | { status: 400 | 422 | 502; fehler: string }

const HOECHSTENS_BYTES = 3 * 1024 * 1024
const WEITERLEITUNGEN = 3
const ZEITGRENZE_MS = 8000

const ungueltig: Ergebnis = { status: 400, fehler: 'Link ungültig' }
const unerreichbar: Ergebnis = { status: 502, fehler: 'Seite nicht erreichbar' }

/** Jede Adresse des Hosts muss öffentlich sein – ein Name kann auf ein internes Netz zeigen. */
async function oeffentlich(url: URL, netz: Netz): Promise<boolean> {
  const host = url.hostname.replace(/^\[|\]$/g, '')
  try {
    const adressen = await netz.lookup(host)
    return adressen.length > 0 && adressen.every((a) => !istPrivateAdresse(a.address))
  } catch {
    return false
  }
}

async function lies(antwort: Response): Promise<string | null> {
  if (!antwort.body) return ''
  const leser = antwort.body.getReader()
  const teile: Uint8Array[] = []
  let laenge = 0
  for (;;) {
    const { done, value } = await leser.read()
    if (done) break
    laenge += value.length
    if (laenge > HOECHSTENS_BYTES) {
      await leser.cancel()
      return null
    }
    teile.push(value)
  }
  const alles = new Uint8Array(laenge)
  let pos = 0
  for (const t of teile) {
    alles.set(t, pos)
    pos += t.length
  }
  return new TextDecoder().decode(alles)
}

/**
 * Holt eine Rezeptseite und liest das Rezept aus. Weiterleitungen werden von Hand verfolgt
 * und jedes Ziel neu geprüft. Gespeichert wird nichts.
 */
export async function holeRezept(link: string, netz: Netz): Promise<Ergebnis> {
  const geprueft = pruefeAdresse(link)
  if (!geprueft.ok) return ungueltig
  let url = geprueft.url
  const signal = AbortSignal.timeout(ZEITGRENZE_MS)
  try {
    for (let schritt = 0; ; schritt++) {
      if (!(await oeffentlich(url, netz))) return ungueltig
      const antwort = await netz.fetch(url.href, {
        redirect: 'manual',
        signal,
        headers: { 'user-agent': 'Mozilla/5.0 (Essensplan; Rezeptimport)', 'accept-language': 'de', accept: 'text/html' },
      })
      if (antwort.status >= 300 && antwort.status < 400) {
        const ziel = antwort.headers.get('location')
        if (!ziel || schritt >= WEITERLEITUNGEN) return unerreichbar
        const naechste = pruefeAdresse(new URL(ziel, url).href)
        if (!naechste.ok) return ungueltig
        url = naechste.url
        continue
      }
      if (antwort.status === 403 || antwort.status === 429) {
        return { status: 502, fehler: 'Die Seite lässt keinen Abruf zu. Rezept bitte von Hand anlegen.' }
      }
      if (!antwort.ok) return unerreichbar
      const html = await lies(antwort)
      if (html === null) return unerreichbar
      const rezept = rezeptAusHtml(html, geprueft.url.href)
      return rezept ? { status: 200, rezept } : { status: 422, fehler: 'Seite enthält kein Rezept in lesbarer Form' }
    }
  } catch {
    return unerreichbar
  }
}
