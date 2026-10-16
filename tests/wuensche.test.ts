import { describe, expect, it } from 'vitest'
import { aenderungen, ausZeilen, vorgangZuZeile, wendeAn, zeileZuVorgang } from '../src/lib/abgleich'
import { schlageWocheVor, zufallAus } from '../src/lib/planer'
import { START_RASTER, startzustand } from '../src/lib/speicher'
import { STARTREZEPTE } from '../src/lib/startrezepte'
import type { Plan } from '../src/lib/typen'
import { aktuelleWuensche, kindAus, wunschStand, wuensche } from '../src/lib/wuensche'
import { baueKatalog } from '../src/lib/zutaten'

const W = '2026-10-17' // Samstag
const plan = (rezeptId: string, tag: number): Plan => ({
  start: W,
  tage: Array.from({ length: 7 }, (_, i) => (i === tag ? { typ: 'rezept', rezeptId, mitResten: true, fixiert: false } : { typ: 'leer' })),
})

describe('Wünsche', () => {
  it('offen, eingeplant, erfüllt – abgelesen aus den Plänen', () => {
    const plaene = { [W]: plan('lasagne', 6) } // Freitag, 23.10.
    expect(wunschStand('pizza-selbst-belegen', '2026-10-18', plaene, '2026-10-19')).toEqual({ art: 'offen' })
    expect(wunschStand('lasagne', '2026-10-18', plaene, '2026-10-19')).toEqual({ art: 'geplant', datum: '2026-10-23' })
    expect(wunschStand('lasagne', '2026-10-18', plaene, '2026-10-24')).toEqual({ art: 'erfuellt', datum: '2026-10-23' })
    // Ein Wunsch nach dem Essen beginnt von vorn.
    expect(wunschStand('lasagne', '2026-10-24', plaene, '2026-10-25')).toEqual({ art: 'offen' })
  })

  it('erfüllte Wünsche zählen nicht mehr mit', () => {
    let w = wuensche({}, 'lasagne', true, '2026-10-18')
    w = wuensche(w, 'pizza-selbst-belegen', true, '2026-10-18')
    const aktuell = aktuelleWuensche(w, { [W]: plan('lasagne', 1) }, '2026-10-20')
    expect([...aktuell.keys()]).toEqual(['pizza-selbst-belegen'])
    expect(wuensche(w, 'lasagne', false, '2026-10-20')).toEqual({ 'pizza-selbst-belegen': '2026-10-18' })
  })

  it('der Kinderwunsch-Tag nimmt den Wunsch', () => {
    for (let saat = 1; saat <= 15; saat++) {
      const p = schlageWocheVor(W, null, {
        rezepte: STARTREZEPTE, katalog: baueKatalog([]), raster: START_RASTER, monat: 10,
        kuerzlich: new Set(), zufall: zufallAus(saat), wuensche: new Set(['kartoffelpuffer-apfelmus']),
      })
      const ids = p.tage.map((t) => (t.typ === 'rezept' ? t.rezeptId : ''))
      expect(ids).toContain('kartoffelpuffer-apfelmus')
    }
  })

  it('ein gewünschtes Nudelgericht landet am Nudeltag', () => {
    for (let saat = 1; saat <= 15; saat++) {
      const p = schlageWocheVor(W, null, {
        rezepte: STARTREZEPTE, katalog: baueKatalog([]), raster: START_RASTER, monat: 10,
        kuerzlich: new Set(), zufall: zufallAus(saat), wuensche: new Set(['lauch-schinken-nudeln']),
      })
      const montag = p.tage[2]
      expect(montag.typ === 'rezept' && montag.rezeptId).toBe('lauch-schinken-nudeln')
    }
  })

  it('wandert als eigene Zeile in die Datenbank und zurück', () => {
    const a = startzustand()
    const b = { ...a, wuensche: { lasagne: '2026-10-18' } }
    const hin = aenderungen(a, b)
    expect(hin).toEqual([{ tabelle: 'wuensche', rezeptId: 'lasagne', an: true, seit: '2026-10-18' }])
    expect(aenderungen(b, a)).toEqual([{ tabelle: 'wuensche', rezeptId: 'lasagne', an: false, seit: '2026-10-18' }])
    const zeile = vorgangZuZeile(hin[0], 'h1')
    expect(zeile).toMatchObject({ tabelle: 'wuensche', konflikt: 'haushalt_id,rezept_id' })
    const zurueck = zeileZuVorgang('wuensche', zeile.zeile)!
    expect(wendeAn(a, zurueck).wuensche).toEqual({ lasagne: '2026-10-18' })
    const geladen = ausZeilen({
      haushalt: null, rezepte: [], plaene: [], haken: [], extras: [], bewertungen: [],
      wuensche: [{ rezept_id: 'lasagne', an: true, seit: '2026-10-18' }, { rezept_id: 'pizza', an: false, seit: '2026-10-01' }],
    })
    expect(geladen.wuensche).toEqual({ lasagne: '2026-10-18' })
  })

  it('das Kind ist die dritte Person', () => {
    expect(kindAus(startzustand().einstellungen.personen)?.id).toBe('p3')
    expect(kindAus([{ id: 'x', name: 'Mia' }])?.name).toBe('Mia')
    expect(kindAus([])).toBeNull()
  })
})
