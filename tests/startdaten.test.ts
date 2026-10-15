import { describe, expect, it } from 'vitest'
import { STARTREZEPTE, START_FRUEHSTUECK } from '../src/lib/startrezepte'
import { START_RASTER } from '../src/lib/speicher'
import { STARTKATALOG, zutatSchluessel } from '../src/lib/zutaten'
import { passtInsFeld } from '../src/lib/planer'

const katalog = new Set(STARTKATALOG.map((z) => zutatSchluessel(z.name)))

describe('Startdaten', () => {
  it('jede Zutat der Startrezepte steht im Katalog – sonst landet sie unbemerkt bei Edeka', () => {
    const fehlend = STARTREZEPTE.flatMap((r) =>
      r.zutaten.filter((z) => !katalog.has(zutatSchluessel(z.name))).map((z) => `${r.name}: ${z.name}`),
    )
    const fruehstueck = START_FRUEHSTUECK.filter((z) => !katalog.has(zutatSchluessel(z.name)))
    expect(fehlend).toEqual([])
    expect(fruehstueck).toEqual([])
  })

  it('Rezept-Ids und Katalognamen sind eindeutig', () => {
    expect(new Set(STARTREZEPTE.map((r) => r.id)).size).toBe(STARTREZEPTE.length)
    expect(katalog.size).toBe(STARTKATALOG.length)
  })

  it('für jedes Feld des Rasters gibt es mindestens drei Gerichte', () => {
    for (const feld of START_RASTER) {
      expect(STARTREZEPTE.filter((r) => passtInsFeld(r, feld)).length, feld).toBeGreaterThanOrEqual(3)
    }
  })

  it('Nudeln gehen immer: die größte Kategorie', () => {
    const nudeln = STARTREZEPTE.filter((r) => r.kategorie === 'nudeln').length
    expect(nudeln).toBeGreaterThanOrEqual(8)
  })
})
