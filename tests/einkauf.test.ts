import { describe, expect, it } from 'vitest'
import { erstelleListe, nachLaden, runde, zeigeMenge } from '../src/lib/einkauf'
import { STARTREZEPTE } from '../src/lib/startrezepte'
import type { Plan, Rezept } from '../src/lib/typen'
import { baueKatalog } from '../src/lib/zutaten'

const katalog = baueKatalog([])
const einst = { portionen: 2.5, mittagsportionen: 2, personen: [] }

function plan(...tage: [string, boolean][]): Plan {
  return {
    start: '2026-10-17',
    tage: tage.map(([rezeptId, mitResten]) => ({ typ: 'rezept' as const, rezeptId, mitResten, fixiert: false })),
  }
}

describe('Einkaufsliste', () => {
  it('rechnet auf den Haushalt um: 2,5 Portionen, mit Resten 4,5', () => {
    const r: Rezept = {
      id: 'x', name: 'X', kategorie: 'nudeln', minuten: 10, portionen: 4, kinderfreundlich: true,
      zutaten: [{ name: 'Spaghetti', menge: 400, einheit: 'g' }], anleitung: '',
    }
    const ohne = erstelleListe(plan(['x', false]), [r], katalog, einst, [])
    const mit = erstelleListe(plan(['x', true]), [r], katalog, einst, [])
    expect(ohne[0].menge).toBe(250)
    expect(mit[0].menge).toBe(450)
  })

  it('zählt dieselbe Zutat aus mehreren Gerichten und dem Frühstück zusammen', () => {
    const liste = erstelleListe(
      plan(['kuerbissuppe', false], ['ofengemuese-feta', false]),
      STARTREZEPTE, katalog, einst, [{ name: 'Hokkaido-kürbis', menge: 100, einheit: 'g' }],
    )
    const kuerbis = liste.filter((p) => p.name === 'Hokkaido-Kürbis')
    expect(kuerbis).toHaveLength(1)
    // (1000 + 500) · 2,5/4 = 937,5 → 950, plus 100 Frühstück → 1037,5 → 1100
    expect(kuerbis[0].menge).toBe(1100)
    expect(kuerbis[0].fuer).toEqual(['Kürbissuppe mit Brot', 'Ofengemüse-Blech mit Feta', 'Frühstück'])
  })

  it('ordnet den Läden zu und markiert Vorrat', () => {
    const liste = erstelleListe(plan(['spaghetti-bolognese', true]), STARTREZEPTE, katalog, einst, [])
    const finde = (n: string) => liste.find((p) => p.name === n)!
    expect(finde('Möhren').laden).toBe('markt')
    expect(finde('Spaghetti').laden).toBe('aldi')
    expect(finde('Olivenöl').vorrat).toBe(true)
    expect(nachLaden(liste, 'markt').map((a) => a.abteilung)).toEqual(['gemuese'])
  })

  it('unbekannte Zutaten landen bei Edeka unter Sonstiges', () => {
    const r: Rezept = {
      id: 'y', name: 'Y', kategorie: 'besonders', minuten: 10, portionen: 4, kinderfreundlich: true,
      zutaten: [{ name: 'Safran', menge: 1, einheit: 'Packung' }], anleitung: '',
    }
    const [p] = erstelleListe(plan(['y', false]), [r], katalog, einst, [])
    expect(p).toMatchObject({ laden: 'edeka', abteilung: 'sonstiges', menge: 1 })
  })

  it('rundet auf kaufbare Mengen', () => {
    expect(runde(2.2, 'Dose')).toBe(2)
    expect(runde(2.3, 'Dose')).toBe(3)
    expect(runde(0.4, 'Stück')).toBe(1)
    expect(runde(937.5, 'g')).toBe(950)
    expect(runde(1250, 'ml')).toBe(1300)
    expect(runde(23, 'g')).toBe(30)
    expect(zeigeMenge(1300, 'ml')).toBe('1,3 l')
    expect(zeigeMenge(2, 'Dose')).toBe('2 Dosen')
    expect(zeigeMenge(1, 'Dose')).toBe('1 Dose')
  })

  it('ein Restetag kauft nichts ein', () => {
    const p: Plan = { start: '2026-10-17', tage: [{ typ: 'restetag' }, { typ: 'leer' }] }
    expect(erstelleListe(p, STARTREZEPTE, katalog, einst, [])).toEqual([])
  })
})
