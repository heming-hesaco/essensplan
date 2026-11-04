import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Server-Funktionen', () => {
  it('relative Importe tragen die Endung .js – Node lädt ESM sonst nicht', () => {
    const ohne = readdirSync('api')
      .filter((d) => d.endsWith('.ts'))
      .flatMap((d) => [...readFileSync(`api/${d}`, 'utf8').matchAll(/from '(\.[^']+)'/g)].map((m) => `${d}: ${m[1]}`))
      .filter((s) => !s.endsWith('.js'))
    expect(ohne).toEqual([])
  })
})
