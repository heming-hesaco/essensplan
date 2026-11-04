import { nachLaden, zeigeMenge, type Posten } from './einkauf'
import { LAEDEN, type ExtraPosten, type Laden } from './typen'
import { zerlege } from './zutatZeile'
import { findeZutat, zutatSchluessel, type Katalog } from './zutaten'

/**
 * Der gemeinsame Einkaufszettel: Schnellknöpfe für Grundnahrungsmittel, Laden für frei
 * eingetippte Posten, und der ganze Zettel als Text zum Teilen. Eigene Posten sind die
 * `extras` der Woche – dieselbe Tabelle wie bisher, keine Datenbankänderung.
 */

export interface Schnellposten {
  name: string
  laden: Laden
}

export const START_SCHNELLPOSTEN: Schnellposten[] = [
  { name: 'Milch', laden: 'aldi' },
  { name: 'Brot', laden: 'markt' },
  { name: 'Brötchen', laden: 'markt' },
  { name: 'Butter', laden: 'aldi' },
  { name: 'Eier', laden: 'markt' },
  { name: 'Joghurt', laden: 'aldi' },
  { name: 'Käse', laden: 'markt' },
  { name: 'Äpfel', laden: 'markt' },
  { name: 'Bananen', laden: 'markt' },
  { name: 'Kaffee', laden: 'aldi' },
  { name: 'Klopapier', laden: 'aldi' },
  { name: 'Spülmittel', laden: 'aldi' },
]

/**
 * `eigen`: selbst auf den Zettel gesetzt – nochmal Tippen nimmt es herunter. `plan`: steht
 * schon über den Wochenplan drauf (Milch fürs Frühstück) – kein zweiter Posten.
 */
export function schnellStand(name: string, posten: Posten[], extras: ExtraPosten[]): 'frei' | 'eigen' | 'plan' {
  const s = zutatSchluessel(name)
  if (extras.some((e) => zutatSchluessel(e.text) === s)) return 'eigen'
  if (posten.some((p) => zutatSchluessel(p.name) === s)) return 'plan'
  return 'frei'
}

export function schalteSchnellposten(extras: ExtraPosten[], s: Schnellposten, neueId: () => string): ExtraPosten[] {
  const schluessel = zutatSchluessel(s.name)
  const ohne = extras.filter((e) => zutatSchluessel(e.text) !== schluessel)
  return ohne.length < extras.length ? ohne : [...extras, { id: neueId(), text: s.name, laden: s.laden }]
}

/** „2 Gurken“ → Wochenmarkt: Menge abtrennen, dann im Katalog suchen (auch Einzahl/Mehrzahl). */
export function ladenFuer(text: string, katalog: Katalog): Laden | null {
  const zeile = zerlege(text, katalog)
  return (findeZutat(zeile.sicher ? zeile.name : text, katalog) ?? null)?.laden ?? null
}

/** Der ganze Zettel als Text: offene Posten, nach Laden gegliedert, im Laufweg sortiert. */
export function zettelText(wochentitel: string, posten: Posten[], extras: ExtraPosten[], abgehakt: Set<string>): string {
  const offen = posten.filter((p) => !abgehakt.has(p.schluessel))
  const abschnitte = LAEDEN.flatMap((laden) => {
    const zeilen = [
      ...nachLaden(offen, laden.id).flatMap((a) => a.posten.map((p) => `• ${p.name} – ${zeigeMenge(p.menge, p.einheit)}`)),
      ...extras.filter((e) => e.laden === laden.id && !abgehakt.has(e.id)).map((e) => `• ${e.text}`),
    ]
    return zeilen.length > 0 ? [`${laden.name}\n${zeilen.join('\n')}`] : []
  })
  return [`Einkauf ${wochentitel}`, ...abschnitte].join('\n\n')
}
