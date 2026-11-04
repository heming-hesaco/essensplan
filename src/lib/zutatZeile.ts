import type { Einheit } from './typen'
import { findeZutat, type Katalog } from './zutaten'

/**
 * Zerlegt eine Zutatenzeile, wie sie auf Rezeptseiten steht („200 g Mehl“, „1 große
 * Zwiebel“, „½ TL Salz“), in Menge, Einheit und Zutat. Was keine Menge hat („Salz und
 * Pfeffer“), bleibt als Zeile stehen und wird als unsicher markiert – das Formular zeigt es
 * zur Prüfung an, statt etwas zu erfinden.
 */

export interface ZutatZeile {
  menge: number
  einheit: Einheit
  name: string
  sicher: boolean
}

const BRUECHE: Record<string, string> = { '½': ' 1/2', '¼': ' 1/4', '¾': ' 3/4', '⅓': ' 1/3', '⅔': ' 2/3' }

/** Einheit nach Schreibweise, mit Faktor auf die Einheit der App (kg → g, l → ml). */
const EINHEITEN: [RegExp, Einheit, number][] = [
  [/^(g|gr|gramm)$/, 'g', 1],
  [/^(kg|kilo|kilogramm)$/, 'g', 1000],
  [/^(ml|milliliter)$/, 'ml', 1],
  [/^cl$/, 'ml', 10],
  [/^(l|liter)$/, 'ml', 1000],
  [/^(el|essl|esslöffel)$/, 'EL', 1],
  [/^(tl|teel|teelöffel)$/, 'TL', 1],
  [/^prisen?$/, 'Prise', 1],
  [/^bund$/, 'Bund', 1],
  [/^dosen?$/, 'Dose', 1],
  [/^(glas|gläser)$/, 'Glas', 1],
  [/^(packung(en)?|pck|pkg|päckchen)$/, 'Packung', 1],
  [/^zehen?$/, 'Zehe', 1],
  [/^(stück|stk)$/, 'Stück', 1],
]

const zahl = (s: string) => Number(s.replace(',', '.'))

export function zerlege(zeile: string, katalog: Katalog): ZutatZeile {
  let t = zeile
  for (const [z, ersatz] of Object.entries(BRUECHE)) t = t.split(z).join(ersatz)
  t = t.replace(/\s+/g, ' ').trim()

  const m = t.match(/^(\d+(?:[.,]\d+)?)(?:\s+(\d+)\/(\d+)|\/(\d+))?(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*/)
  if (!m) return { menge: 1, einheit: 'Stück', name: zeile.trim(), sicher: false }

  let menge = zahl(m[1])
  if (m[2]) menge += zahl(m[2]) / zahl(m[3])
  if (m[4]) menge /= zahl(m[4])
  if (m[5]) menge = zahl(m[5])

  let rest = t.slice(m[0].length)
  let einheit: Einheit = 'Stück'
  const wort = rest.match(/^([A-Za-zÄÖÜäöüß]+)\.?(\s+|$)/)
  if (wort) {
    const treffer = EINHEITEN.find(([re]) => re.test(wort[1].toLowerCase()))
    if (treffer) {
      einheit = treffer[1]
      menge *= treffer[2]
      rest = rest.slice(wort[0].length)
    }
  }

  const name = rest.replace(/\([^)]*\)/g, ' ').split(',')[0].replace(/\s+/g, ' ').trim()
  if (!name) return { menge: 1, einheit: 'Stück', name: zeile.trim(), sicher: false }
  return { menge: Math.round(menge * 1000) / 1000, einheit, name: findeZutat(name, katalog)?.name ?? name, sicher: true }
}

/** Mengenlose Zusätze, die mit dem Gewürz nichts zu tun haben: „etwas Öl“, „n. B. Salz“. */
const OHNE_MENGE = /^(etwas|wenig|reichlich|ein paar|n\. ?b\.|nach belieben|evtl\.|eventuell|optional)\s+|\s+(nach belieben|zum abschmecken|n\. ?b\.)$/gi

/**
 * Wie `zerlege`, aber für Zeilen ohne Menge mit einem zweiten Blick: „Salz und Pfeffer“,
 * „etwas Öl“ oder „Salz, Pfeffer, Muskat“ sind Grundvorrat und werden einzeln eingetragen
 * (je eine Prise, Öl ein Esslöffel), statt als unbekannte Zutat jede Woche auf dem Zettel
 * zu landen. Bleibt etwas unbekannt, bleibt es bei der unsicheren Zeile.
 */
export function zerlegeZutaten(zeile: string, katalog: Katalog): ZutatZeile[] {
  const einfach = zerlege(zeile, katalog)
  if (einfach.sicher) return [einfach]
  const teile = zeile.replace(OHNE_MENGE, ' ').split(/\s+und\s+|\s*[,/&+]\s*/).map((t) => t.replace(OHNE_MENGE, ' ').trim()).filter(Boolean)
  const gefunden = teile.map((t) => findeZutat(t, katalog))
  if (gefunden.length === 0 || gefunden.some((g) => !g?.vorrat)) return [einfach]
  return gefunden.map((g) => ({ menge: 1, einheit: /öl$/i.test(g!.name) ? 'EL' : 'Prise', name: g!.name, sicher: true }))
}
