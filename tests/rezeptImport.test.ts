import { describe, expect, it } from 'vitest'
import type { ImportRezept } from '../api/_rezeptAusHtml'
import { alsRezept } from '../src/lib/rezeptImport'
import { baueKatalog } from '../src/lib/zutaten'

const katalog = baueKatalog([])
const imp: ImportRezept = {
  name: 'Linsensuppe', portionen: 6, minuten: 50,
  zutaten: ['250 g Tellerlinsen', '2 Möhren', 'Deko nach Wahl'], anleitung: '1. Kochen.', quelle: 'https://rezepte.example/linsen',
}

describe('Importiertes Rezept', () => {
  it('wird ein eigenes Rezept mit Quelle und ohne Foto', () => {
    const { rezept, unsicher } = alsRezept(imp, katalog, 'id1')
    expect(rezept).toEqual({
      id: 'id1', name: 'Linsensuppe', kategorie: 'gemuese', minuten: 50, portionen: 6, kinderfreundlich: false,
      zutaten: [
        { name: 'Tellerlinsen', menge: 250, einheit: 'g' },
        { name: 'Möhren', menge: 2, einheit: 'Stück' },
        { name: 'Deko nach Wahl', menge: 1, einheit: 'Stück' },
      ],
      anleitung: '1. Kochen.', quelle: 'https://rezepte.example/linsen',
    })
    expect(unsicher).toEqual([2])
  })

  it('Gewürzzeilen ohne Menge landen als Grundvorrat, nicht als Unbekanntes', () => {
    const { rezept, unsicher } = alsRezept({ ...imp, zutaten: ['Salz und Pfeffer', 'etwas Öl', 'n. B. Salz', 'Salz, Pfeffer, Muskat'] }, katalog, 'id4')
    expect(rezept.zutaten).toEqual([
      { name: 'Salz', menge: 1, einheit: 'Prise' }, { name: 'Pfeffer', menge: 1, einheit: 'Prise' },
      { name: 'Rapsöl', menge: 1, einheit: 'EL' },
      { name: 'Salz', menge: 1, einheit: 'Prise' },
      { name: 'Salz', menge: 1, einheit: 'Prise' }, { name: 'Pfeffer', menge: 1, einheit: 'Prise' }, { name: 'Muskat', menge: 1, einheit: 'Prise' },
    ])
    expect(unsicher).toEqual([])
    for (const z of rezept.zutaten) expect(katalog.get(z.name.toLowerCase())?.vorrat, z.name).toBe(true)
  })

  it('ohne Portionen und Zeit gelten 4 Portionen und 30 Minuten', () => {
    const { rezept } = alsRezept({ ...imp, portionen: null, minuten: null }, katalog, 'id2')
    expect(rezept).toMatchObject({ portionen: 4, minuten: 30 })
  })

  it('ohne Zutaten startet das Formular mit einer leeren Zeile', () => {
    const { rezept, unsicher } = alsRezept({ ...imp, zutaten: [] }, katalog, 'id3')
    expect(rezept.zutaten).toEqual([{ name: '', menge: 1, einheit: 'Stück' }])
    expect(unsicher).toEqual([])
  })
})
