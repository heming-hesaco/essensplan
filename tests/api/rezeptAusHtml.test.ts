import { describe, expect, it } from 'vitest'
import { rezeptAusHtml } from '../../api/_rezeptAusHtml'

const Q = 'https://www.beispiel.de/rezept/1'
const seite = (...bloecke: unknown[]) =>
  `<html><head><title>x</title>${bloecke
    .map((b) => `<script type="application/ld+json">${typeof b === 'string' ? b : JSON.stringify(b)}</script>`)
    .join('')}</head><body>…</body></html>`

const rezept = {
  '@type': 'Recipe',
  name: 'Linsensuppe &amp; Brot',
  recipeYield: '4 Portionen',
  totalTime: 'PT1H15M',
  recipeIngredient: ['250 g Tellerlinsen', '2 Möhren', 'Salz &amp; Pfeffer'],
  recipeInstructions: 'Alles kochen.',
}

describe('Rezept aus HTML', () => {
  it('liest ein Rezept direkt', () => {
    expect(rezeptAusHtml(seite({ '@context': 'https://schema.org', ...rezept }), Q)).toEqual({
      name: 'Linsensuppe & Brot', portionen: 4, minuten: 75,
      zutaten: ['250 g Tellerlinsen', '2 Möhren', 'Salz & Pfeffer'], anleitung: 'Alles kochen.', quelle: Q,
    })
  })

  it('findet das Rezept in @graph, im Array und mit @type als Liste', () => {
    expect(rezeptAusHtml(seite({ '@graph': [{ '@type': 'WebPage' }, rezept] }), Q)?.name).toBe('Linsensuppe & Brot')
    expect(rezeptAusHtml(seite([{ '@type': 'Organization' }, rezept]), Q)?.name).toBe('Linsensuppe & Brot')
    expect(rezeptAusHtml(seite({ ...rezept, '@type': ['Recipe', 'NewsArticle'] }), Q)?.name).toBe('Linsensuppe & Brot')
  })

  it('Anleitung aus Schritten und Abschnitten wird zu nummerierten Absätzen', () => {
    const schritte = { ...rezept, recipeInstructions: [{ '@type': 'HowToStep', text: 'Schneiden.' }, { '@type': 'HowToStep', text: 'Kochen.' }] }
    expect(rezeptAusHtml(seite(schritte), Q)?.anleitung).toBe('1. Schneiden.\n2. Kochen.')
    const abschnitte = { ...rezept, recipeInstructions: [{ '@type': 'HowToSection', name: 'Suppe', itemListElement: [{ '@type': 'HowToStep', text: 'Kochen.' }, { '@type': 'HowToStep', text: 'Würzen.' }] }] }
    expect(rezeptAusHtml(seite(abschnitte), Q)?.anleitung).toBe('1. Kochen.\n2. Würzen.')
    const liste = { ...rezept, recipeInstructions: ['Schneiden.', 'Kochen.'] }
    expect(rezeptAusHtml(seite(liste), Q)?.anleitung).toBe('1. Schneiden.\n2. Kochen.')
  })

  it('Zeit aus Vorbereitung und Kochzeit, Portionen aus Liste oder Zahl', () => {
    const r = { ...rezept, totalTime: undefined, prepTime: 'PT20M', cookTime: 'PT40M', recipeYield: ['4', '4 Stück'] }
    expect(rezeptAusHtml(seite(r), Q)).toMatchObject({ minuten: 60, portionen: 4 })
    expect(rezeptAusHtml(seite({ ...rezept, recipeYield: 6, totalTime: 'P0DT0H30M' }), Q)).toMatchObject({ minuten: 30, portionen: 6 })
    expect(rezeptAusHtml(seite({ ...rezept, recipeYield: undefined, totalTime: undefined }), Q)).toMatchObject({ minuten: null, portionen: null })
  })

  it('ein kaputter Block neben einem gültigen wird übersprungen', () => {
    expect(rezeptAusHtml(seite('{ kaputt', rezept), Q)?.name).toBe('Linsensuppe & Brot')
  })

  it('ohne Rezept gibt es nichts', () => {
    expect(rezeptAusHtml(seite({ '@type': 'WebPage', name: 'Startseite' }), Q)).toBeNull()
    expect(rezeptAusHtml('<html><body>Hallo</body></html>', Q)).toBeNull()
  })
})
