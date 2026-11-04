import { describe, expect, it } from 'vitest'
import type { Posten } from '../src/lib/einkauf'
import { pruefe, startzustand } from '../src/lib/speicher'
import type { ExtraPosten } from '../src/lib/typen'
import { START_SCHNELLPOSTEN, ladenFuer, schalteSchnellposten, schnellStand, zettelText } from '../src/lib/zettel'
import { baueKatalog } from '../src/lib/zutaten'

const katalog = baueKatalog([])
const posten = (name: string, menge: number, einheit: Posten['einheit'], laden: Posten['laden'], abteilung: Posten['abteilung'] = 'gemuese'): Posten => ({
  schluessel: `${name.toLowerCase()}|${einheit}`, name, menge, einheit, laden, abteilung, vorrat: false, bild: '', fuer: [],
})
let n = 0
const neueId = () => `x${++n}`

describe('Schnellknöpfe', () => {
  it('Vorgabe in der abgestimmten Reihenfolge', () => {
    expect(START_SCHNELLPOSTEN.map((s) => s.name)).toEqual(
      ['Milch', 'Brot', 'Brötchen', 'Butter', 'Eier', 'Joghurt', 'Käse', 'Äpfel', 'Bananen', 'Kaffee', 'Klopapier', 'Spülmittel'])
    expect(START_SCHNELLPOSTEN.find((s) => s.name === 'Klopapier')?.laden).toBe('aldi')
    expect(START_SCHNELLPOSTEN.find((s) => s.name === 'Brötchen')?.laden).toBe('markt')
  })

  it('Stand: frei, schon aus dem Plan, selbst gesetzt', () => {
    const plan = [posten('Milch', 3000, 'ml', 'aldi', 'milch')]
    expect(schnellStand('Butter', plan, [])).toBe('frei')
    expect(schnellStand('Milch', plan, [])).toBe('plan')
    expect(schnellStand('Milch', plan, [{ id: 'a', text: 'milch', laden: 'aldi' }])).toBe('eigen')
  })

  it('Tippen setzt den Posten, nochmal Tippen nimmt ihn wieder herunter', () => {
    const butter = { name: 'Butter', laden: 'aldi' as const }
    const gesetzt = schalteSchnellposten([], butter, neueId)
    expect(gesetzt).toEqual([{ id: 'x1', text: 'Butter', laden: 'aldi' }])
    expect(schalteSchnellposten(gesetzt, butter, neueId)).toEqual([])
  })

  it('ein entfernter Knopf lässt den Posten auf dem Zettel', () => {
    const extras: ExtraPosten[] = [{ id: 'k', text: 'Kaffee', laden: 'aldi' }]
    const ohneKaffee = START_SCHNELLPOSTEN.filter((s) => s.name !== 'Kaffee')
    expect(ohneKaffee.find((s) => s.name === 'Kaffee')).toBeUndefined()
    expect(schnellStand('Kaffee', [], extras)).toBe('eigen')
  })

  it('ältere Stände bekommen die Vorgabe', () => {
    const alt = startzustand()
    delete alt.einstellungen.schnellposten
    expect(pruefe(alt).einstellungen.schnellposten).toEqual(START_SCHNELLPOSTEN)
  })
})

describe('Freies Feld', () => {
  it('leitet den Laden aus dem Katalog ab, auch mit Menge und Mehrzahl', () => {
    expect(ladenFuer('2 Gurken', katalog)).toBe('markt')
    expect(ladenFuer('Fischstäbchen', katalog)).toBe('aldi')
    expect(ladenFuer('Zahnpasta', katalog)).toBeNull()
  })
})

describe('Ganzen Zettel teilen', () => {
  it('nur Offenes, nach Laden gegliedert, Läden ohne Offenes fehlen', () => {
    const liste = [
      posten('Kartoffeln', 1500, 'g', 'markt'), posten('Möhren', 4, 'Stück', 'markt'),
      posten('Milch', 3000, 'ml', 'aldi', 'milch'), posten('Mie-Nudeln', 250, 'g', 'edeka', 'trocken'),
    ]
    const extras: ExtraPosten[] = [{ id: 'e1', text: 'Spülmittel', laden: 'aldi' }, { id: 'e2', text: 'Kerzen', laden: 'edeka' }]
    const abgehakt = new Set(['möhren|Stück', 'mie-nudeln|g', 'e2'])
    expect(zettelText('Sa 07.11. – Fr 13.11.', liste, extras, abgehakt)).toBe(
      'Einkauf Sa 07.11. – Fr 13.11.\n\nWochenmarkt\n• Kartoffeln – 1,5 kg\n\nAldi\n• Milch – 3 l\n• Spülmittel',
    )
  })
})
