import { describe, expect, it } from 'vitest'
import { gerichtKosten, preisFuer, wochenKosten, zeigeEuro } from '../src/lib/kosten'
import { schlageWocheVor, zufallAus } from '../src/lib/planer'
import { START_RASTER, startzustand } from '../src/lib/speicher'
import { STARTREZEPTE } from '../src/lib/startrezepte'
import { baueKatalog } from '../src/lib/zutaten'

const katalog = baueKatalog([])
const e = startzustand().einstellungen

describe('Kosten', () => {
  it('rechnet g je Kilogramm, ml je Liter, sonst je Stück', () => {
    expect(preisFuer('Spaghetti', 500, 'g', katalog)).toBeCloseTo(0.8)
    expect(preisFuer('Milch', 1500, 'ml', katalog)).toBeCloseTo(1.65)
    expect(preisFuer('Eier', 6, 'Stück', katalog)).toBeCloseTo(2.1)
    expect(preisFuer('Salz', 5, 'g', katalog)).toBe(0)
    expect(preisFuer('Drachenfrucht', 1, 'Stück', katalog)).toBeNull()
  })

  it('jedes Startgericht hat für alle Zutaten außer Vorrat einen Preis', () => {
    for (const r of STARTREZEPTE) expect(gerichtKosten(r, katalog, e).ohnePreis, r.name).toEqual([])
  })

  it('ein Abendessen für drei liegt in einem glaubhaften Rahmen', () => {
    for (const r of STARTREZEPTE) {
      const k = gerichtKosten(r, katalog, e).euro
      expect(k, r.name).toBeGreaterThan(1)
      expect(k, r.name).toBeLessThan(20)
    }
    const nudeln = STARTREZEPTE.find((r) => r.id === 'pesto-nudeln-tomaten')!
    const lachs = STARTREZEPTE.find((r) => r.id === 'ofenlachs-kartoffeln')!
    expect(gerichtKosten(nudeln, katalog, e).euro).toBeLessThan(gerichtKosten(lachs, katalog, e).euro)
  })

  it('mit Resten fürs Mittagessen kostet ein Gericht mehr', () => {
    const r = STARTREZEPTE[0]
    expect(gerichtKosten(r, katalog, e, true).euro).toBeGreaterThan(gerichtKosten(r, katalog, e).euro)
  })

  it('die Woche: Summe je Laden ergibt das Ganze, Abendessen sind ein Teil davon', () => {
    const z = startzustand()
    const plan = schlageWocheVor('2026-10-17', null, {
      rezepte: z.rezepte, katalog, raster: START_RASTER, monat: 10, kuerzlich: new Set(), zufall: zufallAus(3),
    })
    const k = wochenKosten(plan, z.rezepte, katalog, z.einstellungen, z.fruehstueck)
    const summe = k.jeLaden.markt + k.jeLaden.aldi + k.jeLaden.edeka
    expect(summe).toBeCloseTo(k.gesamt.euro)
    expect(k.abende).toBe(7)
    expect(k.abendessen).toBeLessThan(k.gesamt.euro)
    expect(k.gesamt.euro).toBeGreaterThan(40)
    expect(k.gesamt.euro).toBeLessThan(160)
  })

  it('ein eigener Preis geht vor, der Startpreis bleibt bei nur geändertem Laden', () => {
    const eigen = baueKatalog([
      { name: 'Spaghetti', laden: 'edeka', abteilung: 'trocken', haltbarkeit: 'lang', preis: { g: 3 } },
      { name: 'Reis', laden: 'edeka', abteilung: 'trocken', haltbarkeit: 'lang' },
    ])
    expect(preisFuer('Spaghetti', 1000, 'g', eigen)).toBe(3)
    expect(preisFuer('Reis', 1000, 'g', eigen)).toBeCloseTo(2.2)
    expect(eigen.get('reis')!.laden).toBe('edeka')
  })

  it('zeigt Beträge grob', () => {
    expect(zeigeEuro(73.6)).toBe('ca. 74 €')
    expect(zeigeEuro(5.37)).toBe('ca. 5,40 €')
  })
})
