import { describe, expect, it } from 'vitest'
import { pruefe, startzustand } from '../src/lib/speicher'

describe('Sicherung', () => {
  it('liest eine Sicherung zurück und ergänzt fehlende Felder', () => {
    const z = startzustand()
    const roh = JSON.parse(JSON.stringify({ ...z, extras: undefined, einstellungen: { portionen: 3 } }))
    const gelesen = pruefe(roh)
    expect(gelesen.einstellungen).toMatchObject({ portionen: 3, mittagsportionen: 2 })
    expect(gelesen.einstellungen.personen).toHaveLength(3)
    expect(gelesen.bewertungen).toEqual({})
    expect(gelesen.extras).toEqual({})
    expect(gelesen.rezepte).toHaveLength(z.rezepte.length)
  })

  it('weist fremde Dateien ab', () => {
    expect(() => pruefe({ foo: 1 })).toThrow(/keine Sicherung/)
    expect(() => pruefe(null)).toThrow()
  })
})
