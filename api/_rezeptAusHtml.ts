/**
 * Liest ein Rezept aus dem HTML einer Rezeptseite. Fast alle Rezeptseiten liefern ihre
 * Angaben zusätzlich maschinenlesbar mit (schema.org/Recipe als JSON-LD) – für
 * Suchmaschinen. Genau diese Angaben werden gelesen, nicht der sichtbare Seitentext.
 * Rein und ohne Netz, damit es sich prüfen lässt.
 */

export interface ImportRezept {
  name: string
  portionen: number | null
  minuten: number | null
  zutaten: string[]
  anleitung: string
  quelle: string
}

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

const ENTITAETEN: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }

/** Entitäten auflösen, Tags entfernen, Leerraum glätten – Rezeptseiten liefern beides gern mit. */
function text(wert: Json | undefined): string {
  if (typeof wert === 'number') return String(wert)
  if (typeof wert !== 'string') return ''
  return wert
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (ganz, e: string) => {
      if (e[0] === '#') {
        const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
        return Number.isFinite(code) ? String.fromCodePoint(code) : ganz
      }
      return ENTITAETEN[e.toLowerCase()] ?? ganz
    })
    .replace(/[ \t ]+/g, ' ')
    .trim()
}

function istRezept(x: { [k: string]: Json }): boolean {
  const typ = x['@type']
  return typ === 'Recipe' || (Array.isArray(typ) && typ.includes('Recipe'))
}

function finde(x: Json): { [k: string]: Json } | null {
  if (Array.isArray(x)) {
    for (const e of x) {
      const r = finde(e)
      if (r) return r
    }
    return null
  }
  if (!x || typeof x !== 'object') return null
  if (istRezept(x)) return x
  return finde(x['@graph'] ?? null) ?? finde(x.mainEntity ?? null)
}

/** ISO-8601-Dauer wie PT1H15M oder P0DT0H30M in Minuten; 0 oder Unlesbares ergibt null. */
function minuten(wert: Json | undefined): number | null {
  if (typeof wert !== 'string') return null
  const m = wert.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/)
  if (!m) return null
  const summe = Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return summe > 0 ? summe : null
}

function portionen(wert: Json | undefined): number | null {
  if (Array.isArray(wert)) return portionen(wert[0])
  if (typeof wert === 'number') return wert > 0 ? wert : null
  const m = text(wert).match(/\d+/)
  return m ? Number(m[0]) : null
}

function schritte(wert: Json | undefined): string[] {
  if (Array.isArray(wert)) return wert.flatMap((e) => schritte(e))
  if (typeof wert === 'string') return [text(wert)].filter(Boolean)
  if (wert && typeof wert === 'object') {
    if (wert.itemListElement) return schritte(wert.itemListElement)
    return [text(wert.text ?? wert.name)].filter(Boolean)
  }
  return []
}

export function rezeptAusHtml(html: string, quelle: string): ImportRezept | null {
  const bloecke = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, inhalt] of bloecke) {
    let daten: Json
    try {
      daten = JSON.parse(inhalt)
    } catch {
      continue
    }
    const r = finde(daten)
    if (!r) continue
    const name = text(r.name)
    if (!name) continue
    const anleitungRoh = r.recipeInstructions
    const liste = schritte(anleitungRoh)
    const zutaten = Array.isArray(r.recipeIngredient) ? r.recipeIngredient.map((z) => text(z)).filter(Boolean) : []
    return {
      name,
      portionen: portionen(r.recipeYield),
      minuten: minuten(r.totalTime) ?? ((minuten(r.prepTime) ?? 0) + (minuten(r.cookTime) ?? 0) || null),
      zutaten,
      anleitung: typeof anleitungRoh === 'string' ? text(anleitungRoh) : liste.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      quelle,
    }
  }
  return null
}
