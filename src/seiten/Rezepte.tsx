import { useMemo, useState } from 'react'
import type { SeitenProps } from '../App'
import { merkmale } from '../lib/planer'
import { neueId } from '../lib/speicher'
import {
  ABTEILUNGEN, EINHEITEN, KATEGORIEN, LAEDEN,
  type Abteilung, type Einheit, type Kategorie, type Laden, type Rezept, type ZutatInfo,
} from '../lib/typen'
import { heuteIso, monatVon } from '../lib/woche'
import { zeigeMenge } from '../lib/einkauf'
import { zutatSchluessel, type Katalog } from '../lib/zutaten'

interface Props extends SeitenProps {
  katalog: Katalog
}

type Ansicht = { art: 'liste' } | { art: 'detail'; id: string } | { art: 'bearbeiten'; rezept: Rezept; neu: boolean }

export function Rezepte({ z, aendere, katalog }: Props) {
  const [ansicht, setAnsicht] = useState<Ansicht>({ art: 'liste' })
  const [suche, setSuche] = useState('')
  const [kategorie, setKategorie] = useState<Kategorie | ''>('')
  const monat = monatVon(heuteIso())

  const gefiltert = useMemo(() => {
    const s = suche.trim().toLocaleLowerCase('de-DE')
    return z.rezepte
      .filter((r) => !kategorie || r.kategorie === kategorie)
      .filter((r) => !s || r.name.toLocaleLowerCase('de-DE').includes(s) || r.zutaten.some((zt) => zt.name.toLocaleLowerCase('de-DE').includes(s)))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [z.rezepte, suche, kategorie])

  if (ansicht.art === 'bearbeiten') {
    return (
      <RezeptFormular
        start={ansicht.rezept}
        katalog={katalog}
        abbrechen={() => setAnsicht(ansicht.neu ? { art: 'liste' } : { art: 'detail', id: ansicht.rezept.id })}
        speichern={(rezept, neueZutaten) => {
          aendere((alt) => ({
            ...alt,
            rezepte: ansicht.neu ? [...alt.rezepte, rezept] : alt.rezepte.map((r) => (r.id === rezept.id ? rezept : r)),
            katalog: [...alt.katalog, ...neueZutaten],
          }))
          setAnsicht({ art: 'detail', id: rezept.id })
        }}
      />
    )
  }

  if (ansicht.art === 'detail') {
    const r = z.rezepte.find((x) => x.id === ansicht.id)
    if (!r) return <button onClick={() => setAnsicht({ art: 'liste' })}>← Zurück</button>
    return (
      <>
        <button className="still" onClick={() => setAnsicht({ art: 'liste' })}>← Alle Rezepte</button>
        <article className="karte">
          <h1>{r.name}</h1>
          <p className="marken">
            <span className="marke">{KATEGORIEN[r.kategorie]}</span>
            <span>{r.minuten} Min.</span>
            {r.kinderfreundlich && <span className="marke">Kind mag’s</span>}
          </p>
          <h2>Zutaten für {r.portionen} Portionen</h2>
          <ul className="zutaten">
            {r.zutaten.map((zt, i) => (
              <li key={i}><span>{zt.name}</span><span className="menge">{zeigeMenge(zt.menge, zt.einheit)}</span></li>
            ))}
          </ul>
          <h2>So geht’s</h2>
          <p className="anleitung">{r.anleitung || '—'}</p>
        </article>
        <div className="aktionen">
          <button onClick={() => setAnsicht({ art: 'bearbeiten', rezept: structuredClone(r), neu: false })}>Bearbeiten</button>
          <button onClick={() => setAnsicht({ art: 'bearbeiten', rezept: { ...structuredClone(r), id: neueId(), name: `${r.name} (Kopie)` }, neu: true })}>Kopieren</button>
          <button
            className="gefahr"
            onClick={() => {
              if (!confirm(`„${r.name}“ löschen? Geplante Tage zeigen danach „Gericht wurde gelöscht“.`)) return
              aendere((alt) => ({ ...alt, rezepte: alt.rezepte.filter((x) => x.id !== r.id) }))
              setAnsicht({ art: 'liste' })
            }}
          >
            Löschen
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="kopf">
        <h1>Rezepte</h1>
        <button
          className="haupt"
          onClick={() => setAnsicht({
            art: 'bearbeiten',
            neu: true,
            rezept: { id: neueId(), name: '', kategorie: 'nudeln', minuten: 30, portionen: 4, kinderfreundlich: true, zutaten: [{ name: '', menge: 1, einheit: 'Stück' }], anleitung: '' },
          })}
        >
          + Neues Rezept
        </button>
      </header>
      <input className="suche" type="search" placeholder="Suchen nach Gericht oder Zutat" value={suche} onChange={(e) => setSuche(e.target.value)} aria-label="Rezepte durchsuchen" />
      <div className="chips" role="group" aria-label="Kategorie">
        <button aria-pressed={kategorie === ''} onClick={() => setKategorie('')}>Alle</button>
        {(Object.keys(KATEGORIEN) as Kategorie[]).map((k) => (
          <button key={k} aria-pressed={kategorie === k} onClick={() => setKategorie(k)}>{KATEGORIEN[k]}</button>
        ))}
      </div>
      <ul className="rezeptliste">
        {gefiltert.map((r) => {
          const m = merkmale(r, katalog, monat)
          return (
            <li key={r.id}>
              <button className="karte rezept" onClick={() => setAnsicht({ art: 'detail', id: r.id })}>
                <span className="gericht">{r.name}</span>
                <span className="marken">
                  <span>{KATEGORIEN[r.kategorie]}</span>
                  <span>{r.minuten} Min.</span>
                  {m.saisonAnteil !== null && m.saisonAnteil >= 0.75 && <span className="marke saison">Saison</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {gefiltert.length === 0 && <p className="klein">Nichts gefunden.</p>}
    </>
  )
}

interface FormProps {
  start: Rezept
  katalog: Katalog
  abbrechen: () => void
  speichern: (r: Rezept, neueZutaten: ZutatInfo[]) => void
}

/** Für unbekannte Zutaten fragt das Formular, wo sie gekauft werden. */
function RezeptFormular({ start, katalog, abbrechen, speichern }: FormProps) {
  const [r, setR] = useState<Rezept>(start)
  const [neuInfo, setNeuInfo] = useState<Record<string, { laden: Laden; abteilung: Abteilung }>>({})
  const [fehler, setFehler] = useState('')
  const namen = useMemo(() => [...katalog.values()].map((i) => i.name).sort((a, b) => a.localeCompare(b, 'de')), [katalog])

  const setzeZutat = (i: number, teil: Partial<Rezept['zutaten'][number]>) =>
    setR({ ...r, zutaten: r.zutaten.map((zt, j) => (j === i ? { ...zt, ...teil } : zt)) })

  const unbekannt = [...new Set(r.zutaten.map((zt) => zt.name.trim()).filter((n) => n && !katalog.has(zutatSchluessel(n))))]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const zutaten = r.zutaten.filter((zt) => zt.name.trim()).map((zt) => ({ ...zt, name: zt.name.trim() }))
        if (!r.name.trim()) return setFehler('Bitte einen Namen eingeben.')
        if (zutaten.length === 0) return setFehler('Bitte mindestens eine Zutat eintragen.')
        if (zutaten.some((zt) => !(zt.menge > 0))) return setFehler('Jede Zutat braucht eine Menge über 0.')
        const neueZutaten: ZutatInfo[] = unbekannt.map((name) => ({
          name,
          laden: neuInfo[name]?.laden ?? 'aldi',
          abteilung: neuInfo[name]?.abteilung ?? 'sonstiges',
          haltbarkeit: 'mittel',
        }))
        speichern({ ...r, name: r.name.trim(), zutaten }, neueZutaten)
      }}
    >
      <header className="kopf"><h1>{start.name ? 'Rezept bearbeiten' : 'Neues Rezept'}</h1></header>
      <div className="karte formular">
        <label>Name<input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} required /></label>
        <div className="zeile">
          <label>Kategorie
            <select value={r.kategorie} onChange={(e) => setR({ ...r, kategorie: e.target.value as Kategorie })}>
              {(Object.keys(KATEGORIEN) as Kategorie[]).map((k) => <option key={k} value={k}>{KATEGORIEN[k]}</option>)}
            </select>
          </label>
          <label>Minuten<input type="number" min={5} step={5} value={r.minuten} onChange={(e) => setR({ ...r, minuten: Number(e.target.value) })} /></label>
          <label>Portionen<input type="number" min={1} value={r.portionen} onChange={(e) => setR({ ...r, portionen: Math.max(1, Number(e.target.value)) })} /></label>
        </div>
        <label className="schalter">
          <input type="checkbox" checked={r.kinderfreundlich} onChange={(e) => setR({ ...r, kinderfreundlich: e.target.checked })} />
          Isst das Kind gern (kommt für den Kinderwunsch-Tag infrage)
        </label>

        <fieldset>
          <legend>Zutaten</legend>
          <datalist id="zutatennamen">{namen.map((n) => <option key={n} value={n} />)}</datalist>
          {r.zutaten.map((zt, i) => (
            <div key={i} className="zutat-zeile">
              <input aria-label="Zutat" list="zutatennamen" placeholder="Zutat" value={zt.name} onChange={(e) => setzeZutat(i, { name: e.target.value })} />
              <input aria-label="Menge" type="number" min={0} step="any" value={zt.menge} onChange={(e) => setzeZutat(i, { menge: Number(e.target.value) })} />
              <select aria-label="Einheit" value={zt.einheit} onChange={(e) => setzeZutat(i, { einheit: e.target.value as Einheit })}>
                {EINHEITEN.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <button type="button" className="still" aria-label="Zutat entfernen" onClick={() => setR({ ...r, zutaten: r.zutaten.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setR({ ...r, zutaten: [...r.zutaten, { name: '', menge: 1, einheit: 'g' }] })}>+ Zutat</button>
        </fieldset>

        {unbekannt.length > 0 && (
          <fieldset>
            <legend>Neue Zutaten – wo kauft ihr sie?</legend>
            {unbekannt.map((name) => (
              <div key={name} className="zutat-zeile">
                <span>{name}</span>
                <select aria-label={`Laden für ${name}`} value={neuInfo[name]?.laden ?? 'aldi'} onChange={(e) => setNeuInfo({ ...neuInfo, [name]: { abteilung: neuInfo[name]?.abteilung ?? 'sonstiges', laden: e.target.value as Laden } })}>
                  {LAEDEN.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select aria-label={`Abteilung für ${name}`} value={neuInfo[name]?.abteilung ?? 'sonstiges'} onChange={(e) => setNeuInfo({ ...neuInfo, [name]: { laden: neuInfo[name]?.laden ?? 'aldi', abteilung: e.target.value as Abteilung } })}>
                  {(Object.keys(ABTEILUNGEN) as Abteilung[]).map((a) => <option key={a} value={a}>{ABTEILUNGEN[a]}</option>)}
                </select>
              </div>
            ))}
          </fieldset>
        )}

        <label>So geht’s<textarea rows={5} value={r.anleitung} onChange={(e) => setR({ ...r, anleitung: e.target.value })} /></label>
        {fehler && <p className="warnung" role="alert">{fehler}</p>}
      </div>
      <div className="aktionen">
        <button type="submit" className="haupt">Speichern</button>
        <button type="button" onClick={abbrechen}>Abbrechen</button>
      </div>
    </form>
  )
}
