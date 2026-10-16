import { describe, expect, it } from 'vitest'
import { bewerte, bewertungsPunkte, istLiebling, zusammenfassung, type Bewertungen } from '../src/lib/bewertung'
import { schlageWocheVor, zufallAus } from '../src/lib/planer'
import { START_RASTER } from '../src/lib/speicher'
import { STARTREZEPTE } from '../src/lib/startrezepte'
import { baueKatalog } from '../src/lib/zutaten'

const D = '2026-10-18'

describe('Bewertungen', () => {
  it('fasst zusammen und erkennt Lieblinge', () => {
    let b: Bewertungen = {}
    b = bewerte(b, 'lasagne', 'p1', 3, D)
    b = bewerte(b, 'lasagne', 'p3', 3, D)
    expect(zusammenfassung('lasagne', b)).toEqual({ lecker: 2, geht: 0, nicht: 0 })
    expect(istLiebling('lasagne', b)).toBe(true)
    b = bewerte(b, 'lasagne', 'p2', 1, D)
    expect(istLiebling('lasagne', b)).toBe(false)
    expect(bewertungsPunkte('lasagne', b)).toBeCloseTo(0.8 + 0.8 - 8)
    expect(bewertungsPunkte('unbekannt', b)).toBe(0)
  })

  it('ein „nicht nochmal“ des Kindes hält ein Gericht aus dem Vorschlag', () => {
    const fisch = STARTREZEPTE.filter((r) => r.kategorie === 'fisch').map((r) => r.id)
    let b: Bewertungen = {}
    for (const id of fisch.slice(0, -1)) b = bewerte(b, id, 'p3', 1, D)
    for (let saat = 1; saat <= 20; saat++) {
      const plan = schlageWocheVor('2026-10-24', null, {
        rezepte: STARTREZEPTE, katalog: baueKatalog([]), raster: START_RASTER, monat: 10,
        kuerzlich: new Set(), zufall: zufallAus(saat), bewertungen: b,
      })
      const mittwoch = plan.tage[4]
      expect(mittwoch.typ === 'rezept' && mittwoch.rezeptId).toBe(fisch[fisch.length - 1])
    }
  })
})
