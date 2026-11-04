/**
 * Welche Adressen die Import-Funktion abrufen darf: nur https, und nie etwas im eigenen
 * Netz des Servers. Sonst ließe sich die Funktion als Sprungbrett zu internen Diensten
 * missbrauchen.
 */

function ipv4(ip: string): number[] | null {
  const teile = ip.split('.')
  if (teile.length !== 4 || teile.some((t) => !/^\d{1,3}$/.test(t) || Number(t) > 255)) return null
  return teile.map(Number)
}

export function istPrivateAdresse(ip: string): boolean {
  const v4 = ipv4(ip)
  if (v4) {
    const [a, b] = v4
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    )
  }
  const v6 = ip.toLowerCase().replace(/^\[|\]$/g, '')
  if (v6 === '::' || v6 === '::1') return true
  const eingebettet = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (eingebettet) return istPrivateAdresse(eingebettet[1])
  return /^(fc|fd|fe[89ab]|ff)/.test(v6)
}

export function pruefeAdresse(roh: string): { ok: true; url: URL } | { ok: false; grund: string } {
  let url: URL
  try {
    url = new URL(roh.trim())
  } catch {
    return { ok: false, grund: 'Link ungültig' }
  }
  if (url.protocol !== 'https:') return { ok: false, grund: 'Link ungültig' }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || istPrivateAdresse(host)) {
    return { ok: false, grund: 'Link ungültig' }
  }
  return { ok: true, url }
}
