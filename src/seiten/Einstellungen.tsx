import { useMemo, useRef, useState } from 'react'
import type { SeitenProps } from '../App'
import { pruefe, startzustand } from '../lib/speicher'
import { EINHEITEN, FELDER, LAEDEN, WOCHENTAGE, type Einheit, type Feld, type Laden } from '../lib/typen'
import { heuteIso } from '../lib/woche'
import type { Katalog } from '../lib/zutaten'

interface Props extends SeitenProps {
  katalog: Katalog
}

export function Einstellungen({ z, aendere, katalog }: Props) {
  const datei = useRef<HTMLInputElement>(null)
  const [meldung, setMeldung] = useState('')
  const [zutatSuche, setZutatSuche] = useState('')

  const zutaten = useMemo(() => {
    const s = zutatSuche.trim().toLocaleLowerCase('de-DE')
    return [...katalog.values()]
      .filter((i) => !i.vorrat && (!s || i.name.toLocaleLowerCase('de-DE').includes(s)))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [katalog, zutatSuche])

  const setzeLaden = (name: string, laden: Laden) => {
    const info = zutaten.find((i) => i.name === name)
    if (!info) return
    aendere((alt) => ({ ...alt, katalog: [...alt.katalog.filter((k) => k.name !== name), { ...info, laden }] }))
  }

  const sichern = () => {
    const blob = new Blob([JSON.stringify(z, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `essensplan-${heuteIso()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const einlesen = async (f: File) => {
    try {
      const neu = pruefe(JSON.parse(await f.text()))
      if (!confirm('Den Stand aus der Datei übernehmen? Was hier gerade steht, wird ersetzt.')) return
      aendere(() => neu)
      setMeldung('Sicherung übernommen.')
    } catch (e) {
      setMeldung(e instanceof Error ? e.message : 'Die Datei ließ sich nicht lesen.')
    }
  }

  return (
    <>
      <header className="kopf"><h1>Einstellungen</h1></header>

      <section className="karte formular">
        <h2>Haushalt</h2>
        <label>Portionen je Abendessen
          <input type="number" min={1} step={0.5} value={z.einstellungen.portionen}
            onChange={(e) => aendere((alt) => ({ ...alt, einstellungen: { ...alt.einstellungen, portionen: Math.max(1, Number(e.target.value)) } }))} />
        </label>
        <p className="klein">Zwei Erwachsene und ein Kind von sieben Jahren sind etwa 2,5 Portionen.</p>
        <label>Zusätzliche Portionen fürs Mittagessen aus Resten
          <input type="number" min={0} step={0.5} value={z.einstellungen.mittagsportionen}
            onChange={(e) => aendere((alt) => ({ ...alt, einstellungen: { ...alt.einstellungen, mittagsportionen: Math.max(0, Number(e.target.value)) } }))} />
        </label>
        <p className="klein">Gilt für jeden Tag mit „Mehr kochen für Mittag morgen“.</p>
      </section>

      <section className="karte formular">
        <h2>Wochenraster</h2>
        <p className="klein">Was an welchem Tag vorgeschlagen wird. Die Woche beginnt mit dem Markttag.</p>
        {WOCHENTAGE.map((tag, i) => (
          <label key={tag} className="zeile-label">{tag}
            <select value={z.raster[i]} onChange={(e) => aendere((alt) => ({ ...alt, raster: alt.raster.map((f, j) => (j === i ? (e.target.value as Feld) : f)) }))}>
              {(Object.keys(FELDER) as Feld[]).map((f) => <option key={f} value={f}>{FELDER[f]}</option>)}
            </select>
          </label>
        ))}
      </section>

      <section className="karte formular">
        <h2>Frühstück für die Woche</h2>
        <p className="klein">Feste Mengen, die jede Woche auf die Liste kommen.</p>
        {z.fruehstueck.map((g, i) => (
          <div key={i} className="zutat-zeile">
            <input aria-label="Zutat" value={g.name} onChange={(e) => aendere((alt) => ({ ...alt, fruehstueck: alt.fruehstueck.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))} />
            <input aria-label="Menge" type="number" min={0} step="any" value={g.menge} onChange={(e) => aendere((alt) => ({ ...alt, fruehstueck: alt.fruehstueck.map((x, j) => (j === i ? { ...x, menge: Number(e.target.value) } : x)) }))} />
            <select aria-label="Einheit" value={g.einheit} onChange={(e) => aendere((alt) => ({ ...alt, fruehstueck: alt.fruehstueck.map((x, j) => (j === i ? { ...x, einheit: e.target.value as Einheit } : x)) }))}>
              {EINHEITEN.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <button className="still" aria-label={`${g.name} entfernen`} onClick={() => aendere((alt) => ({ ...alt, fruehstueck: alt.fruehstueck.filter((_, j) => j !== i) }))}>✕</button>
          </div>
        ))}
        <button onClick={() => aendere((alt) => ({ ...alt, fruehstueck: [...alt.fruehstueck, { name: '', menge: 1, einheit: 'Stück' }] }))}>+ Posten</button>
      </section>

      <details className="karte formular">
        <summary><strong>Wo wird was gekauft?</strong></summary>
        <input type="search" placeholder="Zutat suchen" value={zutatSuche} onChange={(e) => setZutatSuche(e.target.value)} aria-label="Zutat suchen" />
        {zutaten.map((i) => (
          <label key={i.name} className="zeile-label">{i.name}
            <select value={i.laden} onChange={(e) => setzeLaden(i.name, e.target.value as Laden)}>
              {LAEDEN.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
        ))}
      </details>

      <section className="karte formular">
        <h2>Daten</h2>
        <p className="klein">
          Alles liegt nur in diesem Browser. Mit einer Sicherung übertragt ihr den Stand auf das
          zweite Handy oder schützt ihn vor dem Löschen der Browserdaten.
        </p>
        <div className="aktionen">
          <button onClick={sichern}>Sicherung herunterladen</button>
          <button onClick={() => datei.current?.click()}>Sicherung einlesen</button>
          <input ref={datei} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && einlesen(e.target.files[0])} />
        </div>
        {meldung && <p className="klein" role="status">{meldung}</p>}
        <button className="gefahr" onClick={() => {
          if (confirm('Alles auf den Anfang zurücksetzen? Pläne, eigene Rezepte und Einstellungen gehen verloren.')) aendere(() => startzustand())
        }}>Alles zurücksetzen</button>
      </section>
    </>
  )
}
