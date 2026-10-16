import { describe, expect, it } from 'vitest'
import { aenderungen, ausZeilen, leererZustand, vorgangZuZeile, wendeAn, zeileZuVorgang, zeilenSchluessel } from '../src/lib/abgleich'
import { startzustand, type Zustand } from '../src/lib/speicher'
import { einreihen, wartetAuf } from '../src/lib/warteschlange'

const W = '2026-10-17'

function mitPlan(z: Zustand): Zustand {
  return { ...z, plaene: { [W]: { start: W, tage: [{ typ: 'rezept', rezeptId: 'lasagne', mitResten: true, fixiert: false }] } } }
}

describe('Änderungen erkennen', () => {
  it('keine Änderung, kein Vorgang', () => {
    const z = startzustand()
    expect(aenderungen(z, z)).toEqual([])
    expect(aenderungen(z, structuredClone(z))).toEqual([])
  })

  it('ein Haken wird eine eigene Zeile – an und wieder ab', () => {
    const a = startzustand()
    const b = { ...a, abgehakt: { [W]: ['spaghetti|g'] } }
    expect(aenderungen(a, b)).toEqual([{ tabelle: 'haken', woche: W, art: 'abgehakt', schluessel: 'spaghetti|g', an: true }])
    expect(aenderungen(b, a)).toEqual([{ tabelle: 'haken', woche: W, art: 'abgehakt', schluessel: 'spaghetti|g', an: false }])
  })

  it('geändertes und gelöschtes Rezept, Plan, Einstellungen, Extras', () => {
    const a = startzustand()
    const b: Zustand = {
      ...mitPlan(a),
      rezepte: a.rezepte.slice(1).map((r, i) => (i === 0 ? { ...r, minuten: 99 } : r)),
      einstellungen: { ...a.einstellungen, portionen: 3 },
      extras: { [W]: [{ id: 'x', text: 'Spülmittel', laden: 'aldi' }] },
    }
    const v = aenderungen(a, b)
    expect(v.map(zeilenSchluessel).sort()).toEqual(
      ['extras:x', 'haushalte', `plaene:${W}`, `rezepte:${a.rezepte[0].id}`, `rezepte:${a.rezepte[1].id}`].sort(),
    )
    expect(v.find((x) => x.tabelle === 'rezepte' && x.id === a.rezepte[0].id)).toMatchObject({ rezept: null })
    const ohneExtra = aenderungen(b, { ...b, extras: { [W]: [] } })
    expect(ohneExtra).toEqual([{ tabelle: 'extras', woche: W, id: 'x', text: 'Spülmittel', laden: 'aldi', geloescht: true }])
  })
})

describe('Hin und zurück', () => {
  it('ein ganzer Stand übersteht Hochladen und Zurücklesen', () => {
    const z: Zustand = {
      ...mitPlan(startzustand()),
      abgehakt: { [W]: ['a|g', 'b|Stück'] },
      vorratLeer: { [W]: ['salz|TL'] },
      extras: { [W]: [{ id: 'x', text: 'Kerzen', laden: 'edeka' }] },
      bewertungen: { lasagne: { p1: { wert: 3, datum: '2026-10-18' }, p3: { wert: 1, datum: '2026-10-18' } } },
      katalog: [{ name: 'Safran', laden: 'edeka', abteilung: 'gewuerz', haltbarkeit: 'lang' }],
    }
    const v = aenderungen(leererZustand(), z)
    // Zeilen bauen, wie sie in der Datenbank stünden …
    const zeilen = v.map((x) => vorgangZuZeile(x, 'h1'))
    const von = (t: string) => zeilen.filter((x) => x.tabelle === t).map((x) => x.zeile as never)
    const zurueck = ausZeilen({
      haushalt: von('haushalte')[0],
      rezepte: von('rezepte'),
      plaene: von('plaene'),
      haken: von('haken'),
      extras: von('extras'),
      bewertungen: von('bewertungen'),
    })
    expect(zurueck).toEqual(z)
  })

  it('Realtime-Zeilen werden wieder zu denselben Vorgängen', () => {
    const z = mitPlan(startzustand())
    for (const v of aenderungen(leererZustand(), z)) {
      const { tabelle, zeile } = vorgangZuZeile(v, 'h1')
      expect(zeileZuVorgang(tabelle, zeile)).toEqual(v)
    }
  })

  it('ein Ereignis vom anderen Handy: abgehakt, gelöschtes Rezept', () => {
    const z = startzustand()
    const id = z.rezepte[0].id
    let n = wendeAn(z, { tabelle: 'haken', woche: W, art: 'abgehakt', schluessel: 'x|g', an: true })
    n = wendeAn(n, { tabelle: 'rezepte', id, rezept: null })
    expect(n.abgehakt[W]).toEqual(['x|g'])
    expect(n.rezepte.find((r) => r.id === id)).toBeUndefined()
    // Dasselbe Ereignis zweimal ändert nichts mehr (eigene Schreibvorgänge kommen als Echo zurück).
    expect(wendeAn(n, { tabelle: 'haken', woche: W, art: 'abgehakt', schluessel: 'x|g', an: true })).toEqual(n)
  })

  it('ein geändertes Rezept bleibt an seiner Stelle', () => {
    const z = startzustand()
    const r = { ...z.rezepte[3], name: 'Neu' }
    expect(wendeAn(z, { tabelle: 'rezepte', id: r.id, rezept: r }).rezepte[3].name).toBe('Neu')
  })
})

describe('Warteschlange', () => {
  it('mehrere Änderungen an derselben Zeile fallen zusammen, die letzte zählt', () => {
    const an = { tabelle: 'haken' as const, woche: W, art: 'abgehakt' as const, schluessel: 'x|g', an: true }
    const ab = { ...an, an: false }
    const andere = { ...an, schluessel: 'y|g' }
    const liste = einreihen(einreihen([], [an, andere]), [ab])
    expect(liste).toEqual([andere, ab])
    expect(wartetAuf(liste, an)).toBe(true)
    expect(wartetAuf(liste, { ...an, schluessel: 'z|g' })).toBe(false)
  })
})

describe('Bewertungen im Abgleich', () => {
  it('jede Person ist eine eigene Zeile, Zurücknehmen wird zu wert = null', () => {
    const a = startzustand()
    const b: Zustand = { ...a, bewertungen: { lasagne: { p1: { wert: 3, datum: W }, p2: { wert: 2, datum: W } } } }
    expect(aenderungen(a, b).map(zeilenSchluessel).sort()).toEqual(['bewertungen:lasagne:p1', 'bewertungen:lasagne:p2'])
    const c: Zustand = { ...b, bewertungen: { lasagne: { p1: { wert: 3, datum: W } } } }
    expect(aenderungen(b, c)).toEqual([{ tabelle: 'bewertungen', rezeptId: 'lasagne', person: 'p2', wert: null, datum: W }])
    expect(wendeAn(b, aenderungen(b, c)[0]).bewertungen).toEqual(c.bewertungen)
    // Die letzte Bewertung weg: kein leerer Eintrag bleibt zurück.
    const leer = wendeAn(c, { tabelle: 'bewertungen', rezeptId: 'lasagne', person: 'p1', wert: null, datum: W })
    expect(leer.bewertungen).toEqual({})
  })

  it('ältere Haushalte ohne Personen bekommen die Startpersonen', () => {
    const z = ausZeilen({ haushalt: { einstellungen: { portionen: 3, mittagsportionen: 1 }, raster: null, fruehstueck: null, katalog: null }, rezepte: [], plaene: [], haken: [], extras: [], bewertungen: [] })
    expect(z.einstellungen.portionen).toBe(3)
    expect(z.einstellungen.personen.map((p) => p.id)).toEqual(['p1', 'p2', 'p3'])
  })
})
