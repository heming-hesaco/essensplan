import { describe, expect, it } from 'vitest'
import { pruefwert } from '../src/lib/grundstock'
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
  it('Schnappschuss passt zum jetzigen Grundstock', async () => {
    const { ALTE_STARTREZEPTE } = await import('../src/lib/startrezepteAlt')
    expect(Object.keys(ALTE_STARTREZEPTE)).toHaveLength(33)
    for (const r of STARTREZEPTE) expect(ALTE_STARTREZEPTE[r.id], r.id).toBe(pruefwert(r))
  })
})
