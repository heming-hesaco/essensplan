import { describe, expect, it } from 'vitest'
import { holeRezept, type Netz } from '../../api/_holeRezept'

const RECIPE = `<script type="application/ld+json">{"@type":"Recipe","name":"Suppe","recipeIngredient":["1 Zwiebel"]}</script>`
const oeffentlich = async () => [{ address: '93.184.216.34', family: 4 }]

function netz(antworten: Record<string, Response>, lookup: Netz['lookup'] = oeffentlich): Netz {
  return { lookup, fetch: async (url) => antworten[String(url)] ?? new Response('nein', { status: 404 }) }
}

describe('Rezept holen', () => {
  it('liefert das Rezept einer Seite', async () => {
    const r = await holeRezept('https://rezepte.example/suppe', netz({ 'https://rezepte.example/suppe': new Response(RECIPE) }))
    expect(r).toMatchObject({ status: 200, rezept: { name: 'Suppe', quelle: 'https://rezepte.example/suppe' } })
  })

  it('eine gesperrte Seite bekommt eine klare Meldung', async () => {
    for (const status of [403, 429]) {
      const r = await holeRezept('https://rezepte.example/x', netz({ 'https://rezepte.example/x': new Response('', { status }) }))
      expect(r).toEqual({ status: 502, fehler: 'Die Seite lässt keinen Abruf zu. Rezept bitte von Hand anlegen.' })
    }
  })

  it('eine Seite ohne Rezept bekommt eine klare Meldung', async () => {
    const r = await holeRezept('https://rezepte.example/x', netz({ 'https://rezepte.example/x': new Response('<html></html>') }))
    expect(r).toEqual({ status: 422, fehler: 'Seite enthält kein Rezept in lesbarer Form' })
  })

  it('folgt Weiterleitungen, prüft jedes Ziel und hört nach dreien auf', async () => {
    const weiter = (ziel: string) => new Response(null, { status: 301, headers: { location: ziel } })
    const ok = await holeRezept('https://a.example/', netz({ 'https://a.example/': weiter('https://b.example/r'), 'https://b.example/r': new Response(RECIPE) }))
    expect(ok.status).toBe(200)
    const intern = await holeRezept('https://a.example/', netz({ 'https://a.example/': weiter('https://127.0.0.1/') }))
    expect(intern).toEqual({ status: 400, fehler: 'Link ungültig' })
    const kette = await holeRezept('https://a.example/', netz({
      'https://a.example/': weiter('https://b.example/'), 'https://b.example/': weiter('https://c.example/'),
      'https://c.example/': weiter('https://d.example/'), 'https://d.example/': weiter('https://e.example/'),
    }))
    expect(kette).toEqual({ status: 502, fehler: 'Seite nicht erreichbar' })
  })

  it('ein Host, der auf eine interne Adresse zeigt, wird nicht abgerufen', async () => {
    let abgerufen = false
    const r = await holeRezept('https://boese.example/', {
      lookup: async () => [{ address: '10.0.0.5', family: 4 }],
      fetch: async () => { abgerufen = true; return new Response(RECIPE) },
    })
    expect(r).toEqual({ status: 400, fehler: 'Link ungültig' })
    expect(abgerufen).toBe(false)
  })

  it('zu große Seiten werden abgebrochen', async () => {
    const riesig = new Response('x'.repeat(3 * 1024 * 1024 + 10))
    const r = await holeRezept('https://rezepte.example/x', netz({ 'https://rezepte.example/x': riesig }))
    expect(r).toEqual({ status: 502, fehler: 'Seite nicht erreichbar' })
  })
})
