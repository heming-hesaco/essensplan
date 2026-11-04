import { describe, expect, it } from 'vitest'
import { istPrivateAdresse, pruefeAdresse } from '../../api/_adresse'

describe('Adresse prüfen', () => {
  it('nimmt normale Rezeptlinks an, auch mit Tracking und Mobil-Host', () => {
    for (const u of ['https://www.chefkoch.de/rezepte/123/x.html?utm_source=a', 'https://m.lecker.de/rezept-1']) {
      expect(pruefeAdresse(u).ok, u).toBe(true)
    }
  })

  it('weist http, Unsinn und interne Hosts ab', () => {
    for (const u of ['http://www.chefkoch.de/x', 'kein link', 'ftp://x.de', 'https://localhost/x', 'https://127.0.0.1/x', 'https://10.1.2.3/', 'https://192.168.0.1/', 'https://[::1]/']) {
      expect(pruefeAdresse(u).ok, u).toBe(false)
    }
  })

  it('erkennt private und besondere Adressen', () => {
    for (const ip of ['127.0.0.1', '10.0.0.1', '172.16.5.4', '172.31.255.255', '192.168.1.1', '169.254.1.1', '0.0.0.0', '224.0.0.1', '100.64.0.1', '::1', '::', 'fc00::1', 'fd12::1', 'fe80::1', '::ffff:127.0.0.1']) {
      expect(istPrivateAdresse(ip), ip).toBe(true)
    }
    for (const ip of ['8.8.8.8', '172.32.0.1', '2a00:1450:4001::1']) expect(istPrivateAdresse(ip), ip).toBe(false)
  })
})
