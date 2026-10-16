import { useMemo, useState } from 'react'
import type { SeitenProps } from '../App'
import { bewerte } from '../lib/bewertung'
import { WERTE, type Rezept, type Wert } from '../lib/typen'
import { heuteIso, letzterSamstag, plusTage, wochentag } from '../lib/woche'
import { MAX_WUENSCHE, aktuelleWuensche, kindAus, wuensche, type WunschStand } from '../lib/wuensche'
import { GerichtBild } from './Bausteine'

const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Was ein Siebenjähriger beim Antippen liest: große Wörter statt „geht so“. */
const KIND_WORTE: Record<Wert, string> = { 3: 'Lecker!', 2: 'Geht so', 1: 'Mag ich nicht' }

/** Was das Kind lesen soll: „Nudeln mit versteckter Gemüsesauce“ verriete den Trick. */
function kindTitel(r: Rezept): string {
  return r.name.replace(/\s*versteckte[nrs]?\s+/i, ' ')
}

function wann(datum: string, heute: string): string {
  if (datum === heute) return 'Gibt’s heute! 🎉'
  if (datum === plusTage(heute, 1)) return 'Gibt’s morgen! 🎉'
  return `Gibt’s am ${TAGE[wochentag(datum)]}! 🎉`
}

/**
 * Die Ansicht fürs Kind: große Bilder, wenig Text. Es sieht, was es heute und diese Woche
 * gibt, sagt, wie es geschmeckt hat, und darf sich drei Gerichte wünschen. Die Wünsche
 * landen im nächsten Wochenvorschlag, am Kinderwunsch-Tag zuerst.
 */
export function KindSeite({ z, aendere }: SeitenProps) {
  const heute = heuteIso()
  const kind = kindAus(z.einstellungen.personen)
  const name = kind && kind.name !== 'Kind' ? kind.name : ''
  const [meldung, setMeldung] = useState('')

  const woche = z.plaene[letzterSamstag(heute)]
  const tage = woche
    ? woche.tage.map((t, i) => ({
        datum: plusTage(woche.start, i),
        rezept: t.typ === 'rezept' ? z.rezepte.find((r) => r.id === t.rezeptId) : undefined,
        reste: t.typ === 'restetag',
      }))
    : []
  const heuteTag = tage.find((t) => t.datum === heute)

  const aktuelle = useMemo(() => aktuelleWuensche(z.wuensche, z.plaene, heute), [z.wuensche, z.plaene, heute])
  const frei = MAX_WUENSCHE - aktuelle.size

  const kindWert = (rezeptId: string) => (kind ? z.bewertungen[rezeptId]?.[kind.id]?.wert : undefined)

  // Nur was als kinderfreundlich markiert ist; was das Kind abgelehnt hat, fällt weg.
  // Lieblinge zuerst, sonst nach Namen – die Reihenfolge ändert sich beim Wünschen nicht,
  // damit keine Kachel unter dem Finger wegspringt.
  const kindId = kind?.id
  const auswahl = useMemo(() => {
    const wert = (id: string) => (kindId ? z.bewertungen[id]?.[kindId]?.wert : undefined)
    return z.rezepte
      .filter((r) => r.kinderfreundlich && (wert(r.id) !== 1 || z.wuensche[r.id] !== undefined))
      .sort((a, b) => Number(wert(b.id) === 3) - Number(wert(a.id) === 3) || a.name.localeCompare(b.name, 'de'))
  }, [z.rezepte, z.bewertungen, z.wuensche, kindId])

  const wuenschen = (r: Rezept) => {
    const an = !aktuelle.has(r.id)
    if (an && frei <= 0) {
      setMeldung(`Du hast schon ${MAX_WUENSCHE} Wünsche. Tipp einen davon an, dann kannst du dir etwas anderes wünschen.`)
      return
    }
    setMeldung(an ? `⭐ ${kindTitel(r)} ist jetzt ein Wunsch!` : '')
    aendere((alt) => ({ ...alt, wuensche: wuensche(alt.wuensche, r.id, an, heute) }))
  }

  return (
    <div className="kind">
      <header className="kind-kopf">
        <h1>Hallo{name ? ` ${name}` : ''}! 👋</h1>
      </header>

      {heuteTag?.rezept && (
        <section className="karte kind-heute">
          <h2>Heute gibt es</h2>
          <GerichtBild rezept={heuteTag.rezept} klasse="kind-heute-bild" />
          <p className="kind-gericht">{kindTitel(heuteTag.rezept)}</p>
          {kind && (
            <>
              <p className="kind-frage">Wie schmeckt’s dir?</p>
              <div className="kind-gesichter" role="group" aria-label="Wie schmeckt’s dir?">
                {WERTE.map((w) => {
                  const rezeptId = heuteTag.rezept!.id
                  const an = kindWert(rezeptId) === w.wert
                  return (
                    <button
                      key={w.wert}
                      className="kind-gesicht"
                      aria-pressed={an}
                      onClick={() => aendere((alt) => ({ ...alt, bewertungen: bewerte(alt.bewertungen, rezeptId, kind.id, an ? null : w.wert, heute) }))}
                    >
                      <span aria-hidden="true">{w.zeichen}</span>
                      {KIND_WORTE[w.wert]}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </section>
      )}
      {heuteTag?.reste && (
        <section className="karte kind-heute"><h2>Heute gibt es</h2><p className="kind-gericht">Reste oder Brotzeit 🥪</p></section>
      )}

      {tage.length > 0 && (
        <section className="karte">
          <h2>Diese Woche</h2>
          <ol className="kind-woche">
            {tage.map((t) => (
              <li key={t.datum} className={t.datum === heute ? 'heute' : t.datum < heute ? 'vorbei' : ''}>
                <span className="kind-tag">{KURZ[wochentag(t.datum)]}</span>
                {t.rezept ? <GerichtBild rezept={t.rezept} klasse="kind-mini" /> : <div className="bild ersatz kind-mini kat-leer" aria-hidden="true"><span>{t.reste ? '🥪' : '❔'}</span></div>}
                <span className="kind-mini-name">{t.rezept ? kindTitel(t.rezept) : t.reste ? 'Reste' : ''}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="karte">
        <h2>Was wünschst du dir?</h2>
        <p className="kind-sterne" aria-live="polite">
          <span aria-hidden="true">{'⭐'.repeat(aktuelle.size)}{'☆'.repeat(Math.max(0, frei))}</span>{' '}
          {frei > 0 ? `Du kannst dir noch ${frei === 1 ? 'ein Gericht' : `${frei} Gerichte`} wünschen.` : 'Alle Wünsche sind vergeben.'}
        </p>
        {meldung && <p className="hinweis" role="status">{meldung}</p>}
        <ul className="kind-raster">
          {auswahl.map((r) => {
            const stand: WunschStand | undefined = aktuelle.get(r.id)
            return (
              <li key={r.id}>
                <button className={`kind-kachel${stand ? ' gewuenscht' : ''}`} aria-pressed={!!stand} onClick={() => wuenschen(r)}>
                  <GerichtBild rezept={r} klasse="kind-kachel-bild" />
                  {stand && <span className="kind-stern" aria-hidden="true">⭐</span>}
                  <span className="kind-kachel-name">{kindTitel(r)}</span>
                  {stand?.art === 'geplant' && <span className="kind-kommt">{wann(stand.datum, heute)}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
