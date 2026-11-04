import { describe, expect, it } from 'vitest'
import { zerlege } from '../src/lib/zutatZeile'
import { baueKatalog, findeZutat } from '../src/lib/zutaten'

const katalog = baueKatalog([])

describe('Katalog finden', () => {
  it.each([
    ['Zwiebel', 'Zwiebeln'],
    ['Ei', 'Eier'],
    ['Tomate', 'Tomaten'],
    ['Kartoffel', 'Kartoffeln'],
    ['große Zwiebel', 'Zwiebeln'],
    ['frische Petersilie', 'Petersilie'],
    ['Eier (Größe M)', 'Eier'],
    ['Gurken', 'Gurke'],
    ['Möhre', 'Möhren'],
  ])('%s → %s', (eingabe, name) => {
    expect(findeZutat(eingabe, katalog)?.name).toBe(name)
  })

  it('unbekannt bleibt unbekannt', () => {
    expect(findeZutat('Zahnpasta', katalog)).toBeNull()
  })
})

describe('Zutatenzeile zerlegen', () => {
  it.each([
    ['200 g Mehl', 200, 'g', 'Mehl', true],
    ['1 kg Kartoffeln, mehligkochend', 1000, 'g', 'Kartoffeln', true],
    ['0,5 l Milch', 500, 'ml', 'Milch', true],
    ['250ml Sahne', 250, 'ml', 'Sahne', true],
    ['½ TL Salz', 0.5, 'TL', 'Salz', true],
    ['1 1/2 EL Olivenöl', 1.5, 'EL', 'Olivenöl', true],
    ['2-3 Zehen Knoblauch', 3, 'Zehe', 'Knoblauch', true],
    ['1 große Zwiebel', 1, 'Stück', 'Zwiebeln', true],
    ['2 Eier (Größe M)', 2, 'Stück', 'Eier', true],
    ['1 Dose stückige Tomaten', 1, 'Dose', 'stückige Tomaten', true],
    ['1 Pck. Backpulver', 1, 'Packung', 'Backpulver', true],
    ['1 Prise Salz', 1, 'Prise', 'Salz', true],
    ['4 cl Sahne', 40, 'ml', 'Sahne', true],
    ['1 Bund Petersilie', 1, 'Bund', 'Petersilie', true],
  ] as const)('%s', (zeile, menge, einheit, name, sicher) => {
    expect(zerlege(zeile, katalog)).toEqual({ menge, einheit, name, sicher })
  })

  it('ohne Menge ist die Zeile unsicher und bleibt lesbar', () => {
    expect(zerlege('Salz und Pfeffer', katalog)).toEqual({ menge: 1, einheit: 'Stück', name: 'Salz und Pfeffer', sicher: false })
    expect(zerlege('etwas Öl', katalog).sicher).toBe(false)
  })

  it('eine Prise Salz ist Grundvorrat', () => {
    const z = zerlege('1 Prise Salz', katalog)
    expect(findeZutat(z.name, katalog)?.vorrat).toBe(true)
  })
})
