import { describe, expect, it } from 'vitest'
import { kurzDatum, letzterSamstag, naechsterSamstag, plusTage } from '../src/lib/woche'

describe('Woche', () => {
  it('der nächste Samstag ist heute, wenn heute Samstag ist', () => {
    expect(naechsterSamstag('2026-10-17')).toBe('2026-10-17')
    expect(naechsterSamstag('2026-10-15')).toBe('2026-10-17')
    expect(naechsterSamstag('2026-10-18')).toBe('2026-10-24')
  })

  it('der letzte Samstag liegt in der laufenden Woche', () => {
    expect(letzterSamstag('2026-10-23')).toBe('2026-10-17')
    expect(letzterSamstag('2026-10-17')).toBe('2026-10-17')
  })

  it('rechnet über Monats- und Zeitumstellungsgrenzen ohne Verschiebung', () => {
    expect(plusTage('2026-10-24', 7)).toBe('2026-10-31')
    expect(plusTage('2026-10-31', 1)).toBe('2026-11-01')
    expect(kurzDatum('2026-10-17')).toBe('Sa, 17.10.')
  })
})
