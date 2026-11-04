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

/** IPv6 in acht 16-Bit-Gruppen, auch mit „::“ und eingebetteter IPv4 am Ende; sonst null. */
function ipv6(ip: string): number[] | null {
  let text = ip.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0]
  const v4 = text.match(/(\d+\.\d+\.\d+\.\d+)$/)
  if (v4) {
    const b = ipv4(v4[1])
    if (!b) return null
    text = text.slice(0, -v4[1].length) + `${((b[0] << 8) | b[1]).toString(16)}:${((b[2] << 8) | b[3]).toString(16)}`
  }
  const teile = text.split('::')
  if (teile.length > 2) return null
  const links = teile[0] ? teile[0].split(':') : []
  const rechts = teile.length === 2 && teile[1] ? teile[1].split(':') : []
  const fehlend = 8 - links.length - rechts.length
  if (teile.length === 1 ? fehlend !== 0 : fehlend < 0) return null
  const gruppen = [...links, ...Array(teile.length === 2 ? fehlend : 0).fill('0'), ...rechts]
  if (gruppen.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null
  return gruppen.map((g) => parseInt(g, 16))
}

function privatV4([a, b]: number[]): boolean {
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

const alsV4 = (hoch: number, tief: number) => [hoch >> 8, hoch & 255, tief >> 8, tief & 255]

/**
 * Privat, Loopback, Link-Local, Multicast oder unspezifiziert – auch wenn eine IPv4-Adresse in
 * IPv6 steckt (::ffff:7f00:1, ::7f00:1, 64:ff9b::/96, 6to4 2002::/16). Node schreibt
 * [::ffff:127.0.0.1] in der URL zu [::ffff:7f00:1] um; deshalb wird jede Schreibweise zerlegt.
 */
export function istPrivateAdresse(ip: string): boolean {
  const v4 = ipv4(ip)
  if (v4) return privatV4(v4)
  const g = ipv6(ip)
  if (!g) return true
  const nullBis = (n: number) => g.slice(0, n).every((x) => x === 0)
  if (nullBis(8)) return true
  if (nullBis(7) && g[7] === 1) return true
  if (nullBis(5) && g[5] === 0xffff) return privatV4(alsV4(g[6], g[7]))
  if (nullBis(6)) return privatV4(alsV4(g[6], g[7]))
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) return privatV4(alsV4(g[6], g[7]))
  if (g[0] === 0x2002) return privatV4(alsV4(g[1], g[2]))
  return (g[0] & 0xfe00) === 0xfc00 || (g[0] & 0xffc0) === 0xfe80 || (g[0] & 0xff00) === 0xff00
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
  const istIp = ipv4(host) !== null || ipv6(host) !== null
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || (istIp && istPrivateAdresse(host))) {
    return { ok: false, grund: 'Link ungültig' }
  }
  return { ok: true, url }
}
