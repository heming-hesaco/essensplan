import { describe, expect, it } from 'vitest'
import { aenderungen } from '../src/lib/abgleich'
import { ALTES_RASTER, GRUNDSTOCK, pruefwert, stelleGrundstockUm } from '../src/lib/grundstock'
import { START_RASTER, startzustand, type Zustand } from '../src/lib/speicher'
import { STARTREZEPTE } from '../src/lib/startrezepte'

describe('Prüfwert', () => {
  it('Prüfwert hängt am Inhalt, nicht am Foto', () => {
    const r = STARTREZEPTE[0]
    const ohneFoto = { ...r, foto: undefined }
    expect(pruefwert(ohneFoto)).toBe(pruefwert(r))
    expect(pruefwert({ ...r, minuten: r.minuten + 1 })).not.toBe(pruefwert(r))
    expect(pruefwert(r)).toMatch(/^[0-9a-f]{8}$/)
  })

  it('Reihenfolge der Schlüssel spielt keine Rolle (jsonb sortiert um)', () => {
    const r = STARTREZEPTE[0]
    const umsortiert = { ...r, zutaten: r.zutaten.map((z) => ({ einheit: z.einheit, menge: z.menge, name: z.name })) }
    expect(pruefwert(umsortiert)).toBe(pruefwert(r))
  })
})

describe('Schnappschuss des alten Grundstocks', () => {
  it('33 Einträge, Werte hex', async () => {
    const { ALTE_STARTREZEPTE } = await import('../src/lib/startrezepteAlt')
    expect(Object.keys(ALTE_STARTREZEPTE)).toHaveLength(33)
    for (const w of Object.values(ALTE_STARTREZEPTE)) expect(w).toMatch(/^[0-9a-f]{8}$/)
  })

  it('die Testvorlage entspricht dem Schnappschuss', async () => {
    const { ALTE_STARTREZEPTE } = await import('../src/lib/startrezepteAlt')
    const { ALTE_REZEPTE } = await import('./fixtures/alteStartrezepte')
    for (const r of ALTE_REZEPTE) expect(pruefwert(r), r.id).toBe(ALTE_STARTREZEPTE[r.id])
  })
})

describe('Übergang auf Grundstock 2', () => {
  // Ein Haushalt mit dem alten Grundstock, so wie er im Oktober angelegt wurde.
  const alterHaushalt = async (): Promise<Zustand> => {
    const { ALTE_REZEPTE } = await import('./fixtures/alteStartrezepte')
    return { ...startzustand(), rezepte: structuredClone(ALTE_REZEPTE), raster: [...ALTES_RASTER] }
  }

  it('unverändertes altes Gericht wird aussortiert, geändertes bleibt', async () => {
    const z = await alterHaushalt()
    z.rezepte = z.rezepte.map((r) => (r.id === 'lasagne' ? { ...r, minuten: 75 } : r))
    const neu = stelleGrundstockUm(z)
    expect(neu.rezepte.find((r) => r.id === 'spaghetti-bolognese')?.archiviert).toBe(true)
    const lasagne = neu.rezepte.find((r) => r.id === 'lasagne')!
    expect(lasagne.archiviert).toBeUndefined()
    expect(lasagne.minuten).toBe(75)
  })

  it('behaltene Id bekommt die neue Fassung, eigenes Foto bleibt', async () => {
    const z = await alterHaushalt()
    z.rezepte = z.rezepte.map((r) => (r.id === 'pizza-selbst-belegen' ? { ...r, foto: { art: 'eigen' as const, pfad: 'h/p.jpg' } } : r))
    const neu = stelleGrundstockUm(z)
    const pizza = neu.rezepte.find((r) => r.id === 'pizza-selbst-belegen')!
    expect(pizza.zutaten.map((x) => x.name)).not.toContain('Kochschinken')
    expect(pizza.foto).toEqual({ art: 'eigen', pfad: 'h/p.jpg' })
    expect(neu.rezepte.find((r) => r.id === 'kuerbissuppe')!.kategorie).toBe('eintopf')
  })

  it('neue Gerichte kommen dazu, keine doppelten Ids', async () => {
    const neu = stelleGrundstockUm(await alterHaushalt())
    const ids = neu.rezepte.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const r of STARTREZEPTE) expect(ids).toContain(r.id)
    expect(neu.einstellungen.grundstock).toBe(GRUNDSTOCK)
  })

  it('ein gelöschtes altes Startgericht kommt nicht zurück', async () => {
    const z = await alterHaushalt()
    z.rezepte = z.rezepte.filter((r) => r.id !== 'chili-sin-carne')
    expect(stelleGrundstockUm(z).rezepte.map((r) => r.id)).not.toContain('chili-sin-carne')
  })

  it('altes Vorgaberaster wird ersetzt, eigenes bleibt', async () => {
    expect(stelleGrundstockUm(await alterHaushalt()).raster).toEqual(START_RASTER)
    const eigen = { ...(await alterHaushalt()), raster: [...ALTES_RASTER].reverse() }
    expect(stelleGrundstockUm(eigen).raster).toEqual([...ALTES_RASTER].reverse())
  })

  it('zweimal anwenden ändert nichts mehr', async () => {
    const einmal = stelleGrundstockUm(await alterHaushalt())
    const zweimal = stelleGrundstockUm(einmal)
    expect(zweimal).toEqual(einmal)
    expect(aenderungen(einmal, zweimal)).toEqual([])
  })

  it('Bewertungen bleiben', async () => {
    const z = { ...(await alterHaushalt()), bewertungen: { lasagne: { p3: { wert: 3 as const, datum: '2026-10-20' } } } }
    expect(stelleGrundstockUm(z).bewertungen).toEqual(z.bewertungen)
  })

  it('ein neuer Haushalt mit Grundstock 2 bleibt unberührt', () => {
    const z = { ...startzustand(), einstellungen: { ...startzustand().einstellungen, grundstock: GRUNDSTOCK } }
    expect(stelleGrundstockUm(z)).toBe(z)
  })
})
