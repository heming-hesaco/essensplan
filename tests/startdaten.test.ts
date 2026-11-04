import { describe, expect, it } from 'vitest'
import { STARTREZEPTE, START_FRUEHSTUECK } from '../src/lib/startrezepte'
import { START_RASTER } from '../src/lib/speicher'
import { STARTKATALOG, zutatSchluessel } from '../src/lib/zutaten'
import { passtInsFeld } from '../src/lib/planer'
import { KATEGORIEN } from '../src/lib/typen'

const katalog = new Set(STARTKATALOG.map((z) => zutatSchluessel(z.name)))

describe('Startdaten', () => {
  it('Kategorien in fester Reihenfolge', () => {
    expect(Object.keys(KATEGORIEN)).toEqual(['gemuese', 'eintopf', 'ofen', 'reis', 'huelsenfruechte', 'fisch', 'nudeln', 'brotzeit', 'besonders'])
  })

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

  it('60 bis 70 Gerichte, 4 bis 5 mit Nudeln', () => {
    expect(STARTREZEPTE.length).toBeGreaterThanOrEqual(60)
    expect(STARTREZEPTE.length).toBeLessThanOrEqual(70)
    const nudeln = STARTREZEPTE.filter((r) => r.kategorie === 'nudeln').length
    expect(nudeln).toBeGreaterThanOrEqual(4)
    expect(nudeln).toBeLessThanOrEqual(5)
  })

  it('Fleisch nur Hähnchen, in höchstens 10 Gerichten', () => {
    const info = new Map(STARTKATALOG.map((z) => [zutatSchluessel(z.name), z]))
    const fleisch = STARTREZEPTE.flatMap((r) =>
      r.zutaten.filter((z) => info.get(zutatSchluessel(z.name))?.abteilung === 'fleisch').map((z) => `${r.name}: ${z.name}`),
    )
    expect(fleisch.filter((f) => !f.split(': ')[1].startsWith('Hähnchen'))).toEqual([])
    const mitHaehnchen = new Set(fleisch.map((f) => f.split(': ')[0]))
    expect(mitHaehnchen.size).toBeLessThanOrEqual(10)
  })

  it('jede Kategorie mindestens 4 Gerichte, Brotzeit mindestens 5', () => {
    for (const k of Object.keys(KATEGORIEN)) {
      expect(STARTREZEPTE.filter((r) => r.kategorie === k).length, k).toBeGreaterThanOrEqual(4)
    }
    expect(STARTREZEPTE.filter((r) => r.kategorie === 'brotzeit').length).toBeGreaterThanOrEqual(5)
  })

  it('jede Zutat außer Grundvorrat hat einen Preis in der benutzten Einheit', () => {
    const info = new Map(STARTKATALOG.map((z) => [zutatSchluessel(z.name), z]))
    const ohne = [...STARTREZEPTE.flatMap((r) => r.zutaten), ...START_FRUEHSTUECK]
      .filter((z) => { const i = info.get(zutatSchluessel(z.name)); return i && !i.vorrat && i.preis?.[z.einheit] === undefined })
      .map((z) => `${z.name} (${z.einheit})`)
    expect([...new Set(ohne)]).toEqual([])
  })
})

describe('Startfotos', () => {
  it('jedes Foto gehört zu einem Startgericht und nennt Urheber, Lizenz und Quelle', async () => {
    const { STARTFOTOS } = await import('../src/lib/startfotos')
    const ids = new Set(STARTREZEPTE.map((r) => r.id))
    for (const [id, f] of Object.entries(STARTFOTOS)) {
      expect(ids.has(id), id).toBe(true)
      expect(f.art).toBe('frei')
      if (f.art !== 'frei') continue
      expect(f.url).toMatch(/^https:\/\/live\.staticflickr\.com\//)
      expect(f.seite).toMatch(/^https:\/\//)
      expect(f.autor.length).toBeGreaterThan(0)
      expect(f.lizenz).toMatch(/^(CC BY(-SA)? \d|CC0|Public Domain)/)
    }
  })

  it('ältere gespeicherte Rezepte ohne Foto bekommen es nachgereicht, eigene bleiben', async () => {
    const { mitStartfotos } = await import('../src/lib/speicher')
    const ohne = STARTREZEPTE.map(({ foto: _f, ...r }) => r)
    const eigen = { ...ohne[0], foto: { art: 'eigen' as const, pfad: 'h/x.jpg' } }
    const neu = mitStartfotos([eigen, ...ohne.slice(1)])
    expect(neu[0].foto).toEqual({ art: 'eigen', pfad: 'h/x.jpg' })
    expect(neu.filter((r) => r.foto).length).toBeGreaterThanOrEqual(38)
  })
})
