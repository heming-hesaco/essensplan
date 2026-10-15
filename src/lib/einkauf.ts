import type {
  Abteilung, Einheit, Einstellungen, Grundposten, Laden, Plan, Rezept,
} from './typen'
import { zutatInfo, zutatSchluessel, type Katalog } from './zutaten'

export interface Posten {
  /** Name und Einheit – dieselbe Zutat in zwei Einheiten bleibt zwei Zeilen. */
  schluessel: string
  name: string
  menge: number
  einheit: Einheit
  laden: Laden
  abteilung: Abteilung
  vorrat: boolean
  /** Wofür die Zutat gebraucht wird (Gerichtsnamen bzw. „Frühstück“). */
  fuer: string[]
}

/** Portionen für ein Abendessen, mit oder ohne Reste fürs Mittagessen. */
export function portionenFuer(mitResten: boolean, e: Einstellungen): number {
  return e.portionen + (mitResten ? e.mittagsportionen : 0)
}

const STUECKIG: Einheit[] = ['Stück', 'Zehe', 'Dose', 'Glas', 'Packung', 'Bund']

/**
 * Rundet auf eine kaufbare Menge. Stückiges wird erst ab einem Viertel darüber
 * aufgerundet – 2,2 Dosen sind zwei Dosen, nicht drei.
 */
export function runde(menge: number, einheit: Einheit): number {
  if (menge <= 0) return 0
  if (STUECKIG.includes(einheit)) return Math.max(1, Math.ceil(menge - 0.25))
  if (einheit === 'g' || einheit === 'ml') {
    const schritt = menge < 100 ? 10 : menge < 1000 ? 50 : 100
    return Math.ceil(menge / schritt - 1e-9) * schritt
  }
  return Math.max(1, Math.ceil(menge - 1e-9))
}

const MEHRZAHL: Partial<Record<Einheit, string>> = {
  Zehe: 'Zehen', Dose: 'Dosen', Glas: 'Gläser', Packung: 'Packungen', Prise: 'Prisen',
}

function zahl(n: number): string {
  return n.toLocaleString('de-DE', { maximumFractionDigits: 1 })
}

export function zeigeMenge(menge: number, einheit: Einheit): string {
  if (einheit === 'g' && menge >= 1000) return `${zahl(menge / 1000)} kg`
  if (einheit === 'ml' && menge >= 1000) return `${zahl(menge / 1000)} l`
  const wort = menge === 1 ? einheit : MEHRZAHL[einheit] ?? einheit
  return `${zahl(menge)} ${wort}`
}

/** Alle Zutaten der Woche, zusammengezählt, auf den Haushalt umgerechnet und gerundet. */
export function erstelleListe(
  plan: Plan,
  rezepte: Rezept[],
  katalog: Katalog,
  einstellungen: Einstellungen,
  fruehstueck: Grundposten[],
): Posten[] {
  const summen = new Map<string, Posten>()
  const addiere = (name: string, menge: number, einheit: Einheit, fuer: string) => {
    const info = zutatInfo(katalog, name)
    const schluessel = `${zutatSchluessel(name)}|${einheit}`
    const p = summen.get(schluessel) ?? {
      schluessel,
      name: info.name,
      menge: 0,
      einheit,
      laden: info.laden,
      abteilung: info.abteilung,
      vorrat: info.vorrat === true,
      fuer: [],
    }
    p.menge += menge
    if (!p.fuer.includes(fuer)) p.fuer.push(fuer)
    summen.set(schluessel, p)
  }

  for (const tag of plan.tage) {
    if (tag.typ !== 'rezept') continue
    const rezept = rezepte.find((r) => r.id === tag.rezeptId)
    if (!rezept) continue
    const faktor = portionenFuer(tag.mitResten, einstellungen) / rezept.portionen
    for (const z of rezept.zutaten) addiere(z.name, z.menge * faktor, z.einheit, rezept.name)
  }
  for (const g of fruehstueck) addiere(g.name, g.menge, g.einheit, 'Frühstück')

  return [...summen.values()]
    .map((p) => ({ ...p, menge: runde(p.menge, p.einheit) }))
    .filter((p) => p.menge > 0)
}

/** Laufweg: auf dem Markt Stand für Stand, bei Aldi und Edeka grob der Gang durch die Filiale. */
const REIHENFOLGE: Record<Laden, Abteilung[]> = {
  markt: ['gemuese', 'obst', 'brot', 'kaese', 'eier', 'milch', 'fleisch', 'fisch', 'trocken', 'konserve', 'tk', 'gewuerz', 'sonstiges'],
  aldi: ['obst', 'gemuese', 'brot', 'milch', 'kaese', 'eier', 'fleisch', 'fisch', 'trocken', 'konserve', 'gewuerz', 'tk', 'sonstiges'],
  edeka: ['obst', 'gemuese', 'brot', 'milch', 'kaese', 'eier', 'fleisch', 'fisch', 'trocken', 'konserve', 'gewuerz', 'tk', 'sonstiges'],
}

export interface Abschnitt {
  abteilung: Abteilung
  posten: Posten[]
}

export function nachLaden(posten: Posten[], laden: Laden): Abschnitt[] {
  return REIHENFOLGE[laden]
    .map((abteilung) => ({
      abteilung,
      posten: posten
        .filter((p) => p.laden === laden && p.abteilung === abteilung)
        .sort((a, b) => a.name.localeCompare(b.name, 'de')),
    }))
    .filter((a) => a.posten.length > 0)
}
