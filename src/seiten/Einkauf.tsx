import { useMemo, useState } from 'react'
import type { SeitenProps } from '../App'
import { erstelleListe, nachLaden, zeigeMenge, type Posten } from '../lib/einkauf'
import { neueId } from '../lib/speicher'
import { ABTEILUNGEN, LAEDEN, type Laden } from '../lib/typen'
import type { Katalog } from '../lib/zutaten'
import { WochenKopf } from './WochenKopf'

interface Props extends SeitenProps {
  katalog: Katalog
  woche: string
  setWoche: (w: string) => void
}

export function Einkauf({ z, aendere, katalog, woche, setWoche }: Props) {
  const plan = z.plaene[woche]
  const posten = useMemo(
    () => (plan ? erstelleListe(plan, z.rezepte, katalog, z.einstellungen, z.fruehstueck) : []),
    [plan, z.rezepte, katalog, z.einstellungen, z.fruehstueck],
  )
  const abgehakt = new Set(z.abgehakt[woche] ?? [])
  const leer = new Set(z.vorratLeer[woche] ?? [])
  const extras = z.extras[woche] ?? []
  const vorrat = posten.filter((p) => p.vorrat)
  const zuKaufen = posten.filter((p) => !p.vorrat || leer.has(p.schluessel))
  const [neu, setNeu] = useState('')
  const [neuLaden, setNeuLaden] = useState<Laden>('aldi')
  const [geteilt, setGeteilt] = useState('')

  const umschalten = (feld: 'abgehakt' | 'vorratLeer', schluessel: string) =>
    aendere((alt) => {
      const menge = new Set(alt[feld][woche] ?? [])
      if (menge.has(schluessel)) menge.delete(schluessel)
      else menge.add(schluessel)
      return { ...alt, [feld]: { ...alt[feld], [woche]: [...menge] } }
    })

  const setzeExtras = (liste: typeof extras) => aendere((alt) => ({ ...alt, extras: { ...alt.extras, [woche]: liste } }))

  const teile = async (laden: Laden) => {
    const name = LAEDEN.find((l) => l.id === laden)!.name
    const zeilen = [
      ...zuKaufen.filter((p) => p.laden === laden && !abgehakt.has(p.schluessel)).map((p) => `• ${p.name} – ${zeigeMenge(p.menge, p.einheit)}`),
      ...extras.filter((e) => e.laden === laden && !abgehakt.has(e.id)).map((e) => `• ${e.text}`),
    ]
    const text = `${name}\n${zeilen.join('\n')}`
    try {
      if (navigator.share) await navigator.share({ title: `Einkauf ${name}`, text })
      else {
        await navigator.clipboard.writeText(text)
        setGeteilt(`${name}: Liste kopiert`)
      }
    } catch {
      // Teilen abgebrochen – nichts zu tun.
    }
  }

  if (!plan) {
    return (
      <>
        <WochenKopf titel="Einkauf" woche={woche} setWoche={setWoche} />
        <p className="karte leerzustand">Für diese Woche gibt es noch keinen Plan. Erst planen, dann einkaufen.</p>
      </>
    )
  }

  const offen = zuKaufen.filter((p) => !abgehakt.has(p.schluessel)).length + extras.filter((e) => !abgehakt.has(e.id)).length

  return (
    <>
      <WochenKopf titel="Einkauf" woche={woche} setWoche={setWoche} />
      <p className="klein">
        {offen === 0 ? 'Alles erledigt. 🎉' : `Noch ${offen} Posten offen.`} Mengen für {String(z.einstellungen.portionen).replace('.', ',')} Portionen je Abendessen, Frühstück eingerechnet.
      </p>

      {vorrat.length > 0 && (
        <details className="karte">
          <summary>
            <strong>Vor dem Einkauf: Vorrat prüfen</strong>{' '}
            <span className="klein">({leer.size > 0 ? `${vorrat.filter((p) => leer.has(p.schluessel)).length} leer` : 'alles da?'})</span>
          </summary>
          <p className="klein">Was leer ist, antippen – es kommt dann auf die Aldi-Liste.</p>
          <ul className="liste">
            {vorrat.map((p) => (
              <li key={p.schluessel}>
                <label className="posten">
                  <input type="checkbox" checked={leer.has(p.schluessel)} onChange={() => umschalten('vorratLeer', p.schluessel)} />
                  <span className="posten-name">{p.name}</span>
                  <span className="klein">leer</span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}

      {LAEDEN.map((laden) => {
        const abschnitte = nachLaden(zuKaufen, laden.id)
        const eigene = extras.filter((e) => e.laden === laden.id)
        if (abschnitte.length === 0 && eigene.length === 0) return null
        return (
          <section key={laden.id} className="karte laden">
            <div className="laden-kopf">
              <h2>{laden.name}</h2>
              <button onClick={() => teile(laden.id)}>Teilen</button>
            </div>
            {abschnitte.map((a) => (
              <div key={a.abteilung}>
                <h3>{ABTEILUNGEN[a.abteilung]}</h3>
                <ul className="liste">
                  {sortiert(a.posten, abgehakt).map((p) => (
                    <li key={p.schluessel}>
                      <label className={`posten${abgehakt.has(p.schluessel) ? ' erledigt' : ''}`}>
                        <input type="checkbox" checked={abgehakt.has(p.schluessel)} onChange={() => umschalten('abgehakt', p.schluessel)} />
                        <span className="posten-name">
                          {p.name}
                          <span className="klein fuer">{p.fuer.join(' · ')}</span>
                        </span>
                        <span className="menge">{zeigeMenge(p.menge, p.einheit)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {eigene.length > 0 && (
              <>
                <h3>Dazu</h3>
                <ul className="liste">
                  {eigene.map((e) => (
                    <li key={e.id}>
                      <label className={`posten${abgehakt.has(e.id) ? ' erledigt' : ''}`}>
                        <input type="checkbox" checked={abgehakt.has(e.id)} onChange={() => umschalten('abgehakt', e.id)} />
                        <span className="posten-name">{e.text}</span>
                        <button className="still" aria-label={`${e.text} entfernen`} onClick={(ev) => { ev.preventDefault(); setzeExtras(extras.filter((x) => x.id !== e.id)) }}>✕</button>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )
      })}
      {geteilt && <p className="klein" role="status">{geteilt}</p>}

      <form
        className="karte zeile"
        onSubmit={(e) => {
          e.preventDefault()
          if (!neu.trim()) return
          setzeExtras([...extras, { id: neueId(), text: neu.trim(), laden: neuLaden }])
          setNeu('')
        }}
      >
        <input aria-label="Weiterer Posten" placeholder="Weiteres, z. B. Spülmittel" value={neu} onChange={(e) => setNeu(e.target.value)} />
        <select aria-label="Laden" value={neuLaden} onChange={(e) => setNeuLaden(e.target.value as Laden)}>
          {LAEDEN.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <button type="submit">Hinzufügen</button>
      </form>

      {abgehakt.size > 0 && (
        <button className="still" onClick={() => aendere((alt) => ({ ...alt, abgehakt: { ...alt.abgehakt, [woche]: [] } }))}>
          Alle Haken entfernen
        </button>
      )}
    </>
  )
}

/** Erledigtes rutscht nach unten, damit im Laden oben steht, was noch fehlt. */
function sortiert(posten: Posten[], abgehakt: Set<string>): Posten[] {
  return [...posten].sort((a, b) => Number(abgehakt.has(a.schluessel)) - Number(abgehakt.has(b.schluessel)))
}
