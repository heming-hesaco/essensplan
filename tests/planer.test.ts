import { describe, expect, it } from 'vitest'
import { schlageWocheVor, tauscheTag, ueberblick, zufallAus, type PlanKontext } from '../src/lib/planer'
import { START_RASTER } from '../src/lib/speicher'
import { STARTREZEPTE } from '../src/lib/startrezepte'
import type { Plan, Rezept } from '../src/lib/typen'
import { baueKatalog } from '../src/lib/zutaten'

const katalog = baueKatalog([])

function ctx(teil: Partial<PlanKontext> = {}): PlanKontext {
  return {
    rezepte: STARTREZEPTE,
    katalog,
    raster: START_RASTER,
    monat: 10,
    kuerzlich: new Set(),
    zufall: zufallAus(1),
    ...teil,
  }
}

const ids = (p: Plan) => p.tage.map((t) => (t.typ === 'rezept' ? t.rezeptId : t.typ))
const rezept = (id: string) => STARTREZEPTE.find((r) => r.id === id) as Rezept

describe('Wochenvorschlag', () => {
  it('füllt alle sieben Tage, jedes Gericht höchstens einmal, passend zum Raster', () => {
    const plan = schlageWocheVor('2026-10-17', null, ctx())
    const gewaehlt = ids(plan)
    expect(gewaehlt).toHaveLength(7)
    expect(new Set(gewaehlt).size).toBe(7)
    expect(rezept(gewaehlt[2]).kategorie).toBe('nudeln')
    expect(rezept(gewaehlt[4]).kategorie).toBe('fisch')
    expect(rezept(gewaehlt[6]).kinderfreundlich).toBe(true)
  })

  it('bevorzugt Saisonware: im Oktober Kürbis statt Kirschtomaten', () => {
    const nurGemuese = ctx({ raster: Array(7).fill('nudeln'), zufall: () => 0 })
    const oktober = ids(schlageWocheVor('2026-10-17', null, nurGemuese))
    expect(oktober.indexOf('kuerbis-sahne-pasta')).toBeLessThan(oktober.indexOf('pesto-nudeln-tomaten'))
  })

  it('Gerichte der letzten zwei Wochen kommen nur, wenn nichts anderes passt', () => {
    const fisch = STARTREZEPTE.filter((r) => r.kategorie === 'fisch').map((r) => r.id)
    const kuerzlich = new Set(fisch.slice(0, -1))
    const plan = schlageWocheVor('2026-10-17', null, ctx({ kuerzlich }))
    expect(ids(plan)[4]).toBe(fisch[fisch.length - 1])
  })

  it('fixierte Tage und Restetage bleiben stehen', () => {
    const erster = schlageWocheVor('2026-10-17', null, ctx())
    erster.tage[1] = { typ: 'rezept', rezeptId: 'apfelpfannkuchen', mitResten: false, fixiert: true }
    erster.tage[6] = { typ: 'restetag' }
    const zweiter = schlageWocheVor('2026-10-17', erster, ctx({ zufall: zufallAus(99) }))
    expect(zweiter.tage[1]).toEqual(erster.tage[1])
    expect(zweiter.tage[6]).toEqual({ typ: 'restetag' })
    expect(ids(zweiter).filter((id) => id === 'apfelpfannkuchen')).toHaveLength(1)
  })

  it('Empfindliches rutscht an den Wochenanfang', () => {
    // Zwei sonst gleichwertige Gerichte, eins mit frischem Hähnchen.
    const a: Rezept = { ...rezept('nudeln-gemuesesauce'), id: 'a', zutaten: [{ name: 'Fusilli', menge: 500, einheit: 'g' }] }
    const b: Rezept = { ...a, id: 'b', zutaten: [{ name: 'Hähnchenbrustfilet', menge: 400, einheit: 'g' }] }
    const plan = schlageWocheVor('2026-10-17', null, ctx({ rezepte: [a, b], raster: Array(7).fill('nudeln'), zufall: () => 0 }))
    expect(ids(plan).slice(0, 2)).toEqual(['b', 'a'])
  })

  it('Tauschen ersetzt nur den einen Tag und wiederholt nichts aus der Woche', () => {
    const plan = schlageWocheVor('2026-10-17', null, ctx())
    const getauscht = tauscheTag(plan, 2, ctx())
    expect(ids(getauscht)[2]).not.toBe(ids(plan)[2])
    expect(rezept(ids(getauscht)[2]).kategorie).toBe('nudeln')
    expect(ids(getauscht).filter((_, i) => i !== 2)).toEqual(ids(plan).filter((_, i) => i !== 2))
    expect(new Set(ids(getauscht)).size).toBe(7)
  })
})

describe('Überblick', () => {
  it('zählt Fisch, Fleisch und Vegetarisches und findet gemeinsame Saisonzutaten', () => {
    const plan: Plan = {
      start: '2026-10-17',
      tage: ['kuerbissuppe', 'ofengemuese-feta', 'spaghetti-bolognese', 'thunfisch-nudeln'].map((id) => ({
        typ: 'rezept' as const, rezeptId: id, mitResten: true, fixiert: false,
      })),
    }
    const u = ueberblick(plan, STARTREZEPTE, katalog, 10)
    expect(u).toMatchObject({ gerichte: 4, fleisch: 1, fisch: 1, vegetarisch: 2 })
    expect(u.gemeinsam).toContainEqual({ name: 'Hokkaido-Kürbis', anzahl: 2 })
    expect(u.gemeinsam.map((g) => g.name)).not.toContain('Zwiebeln')
  })
})
