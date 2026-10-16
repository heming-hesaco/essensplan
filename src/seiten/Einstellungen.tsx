import { useMemo, useRef, useState } from 'react'
import type { SeitenProps } from '../App'
import { pruefe, startzustand } from '../lib/speicher'
import { EINHEITEN, FELDER, LAEDEN, WOCHENTAGE, type Einheit, type Feld, type Laden } from '../lib/typen'
import { heuteIso } from '../lib/woche'
import type { Gemeinsam } from '../lib/useGemeinsam'
import { zutatSchluessel, type Katalog } from '../lib/zutaten'
import { GemeinsamBereich } from './Gemeinsam'

interface Props extends SeitenProps {
  katalog: Katalog
  gemeinsam: Gemeinsam
}

export function Einstellungen({ z, aendere, katalog, gemeinsam }: Props) {
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

  /** In welchen Einheiten eine Zutat in Rezepten und Frühstück vorkommt – dafür braucht sie einen Preis. */
  const einheiten = useMemo(() => {
    const m = new Map<string, Set<Einheit>>()
    for (const zt of [...z.rezepte.flatMap((r) => r.zutaten), ...z.fruehstueck]) {
      const key = zutatSchluessel(zt.name)
      if (!m.has(key)) m.set(key, new Set())
      m.get(key)!.add(zt.einheit)
    }
    return m
  }, [z.rezepte, z.fruehstueck])

  const setzePreis = (name: string, einheit: Einheit, text: string) => {
    const info = zutaten.find((i) => i.name === name)
    if (!info) return
    const wert = Number(text.replace(',', '.'))
    const preis = { ...info.preis }
    if (text.trim() === '' || !(wert >= 0)) delete preis[einheit]
    else preis[einheit] = Math.round(wert * 100) / 100
    // Nur Hineinklicken und wieder Hinaus ändert nichts und soll auch nichts abgleichen.
    if (preis[einheit] === info.preis?.[einheit]) return
    aendere((alt) => ({ ...alt, katalog: [...alt.katalog.filter((k) => k.name !== name), { ...info, preis }] }))
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

      <GemeinsamBereich g={gemeinsam} />

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
        <fieldset>
          <legend>Wer bewertet?</legend>
          <p className="klein">Jede Person bewertet Gerichte mit 😋 🙂 😖. Die Namen lassen sich ändern, die Bewertungen bleiben.</p>
          {z.einstellungen.personen.map((p, i) => (
            <label key={p.id} className="zeile-label">Person {i + 1}
              <input
                value={p.name}
                maxLength={30}
                onChange={(e) => aendere((alt) => ({
                  ...alt,
                  einstellungen: { ...alt.einstellungen, personen: alt.einstellungen.personen.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) },
                }))}
              />
            </label>
          ))}
        </fieldset>
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
        <summary><strong>Wo wird was gekauft – und was kostet es?</strong></summary>
        <p className="klein">
          Die Preise sind grobe Schätzungen und ergeben die Kosten der Woche. Tragt ein, was ihr
          wirklich zahlt; ein leeres Feld nimmt den Startwert.
        </p>
        <input type="search" placeholder="Zutat suchen" value={zutatSuche} onChange={(e) => setZutatSuche(e.target.value)} aria-label="Zutat suchen" />
        {zutaten.map((i) => {
          const genutzt = [...new Set<Einheit>([...(einheiten.get(zutatSchluessel(i.name)) ?? []), ...(Object.keys(i.preis ?? {}) as Einheit[])])]
          return (
            <div key={i.name} className="preis-zeile">
              <label className="zeile-label">{i.name}
                <select value={i.laden} onChange={(e) => setzeLaden(i.name, e.target.value as Laden)}>
                  {LAEDEN.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
              {genutzt.filter((e) => e !== 'EL' && e !== 'TL' && e !== 'Prise').map((e) => (
                <label key={e} className="zeile-label preis">
                  <span className="klein">€ je {e === 'g' ? 'kg' : e === 'ml' ? 'Liter' : e}</span>
                  <input
                    key={`${i.name}-${e}-${i.preis?.[e] ?? ''}`}
                    inputMode="decimal"
                    defaultValue={i.preis?.[e] !== undefined ? i.preis[e]!.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                    placeholder="—"
                    aria-label={`Preis ${i.name} je ${e === 'g' ? 'kg' : e === 'ml' ? 'Liter' : e}`}
                    onBlur={(ev) => setzePreis(i.name, e, ev.target.value)}
                  />
                </label>
              ))}
            </div>
          )
        })}
      </details>

      <section className="karte formular">
        <h2>Daten</h2>
        <p className="klein">
          {gemeinsam.haushalt
            ? 'Eine Sicherung ist eine Kopie des gemeinsamen Stands. Einlesen ändert Rezepte, Pläne und Einstellungen für den ganzen Haushalt.'
            : 'Alles liegt nur in diesem Browser. Mit einer Sicherung übertragt ihr den Stand auf ein anderes Gerät oder schützt ihn vor dem Löschen der Browserdaten.'}
        </p>
        <div className="aktionen">
          <button onClick={sichern}>Sicherung herunterladen</button>
          <button onClick={() => datei.current?.click()}>Sicherung einlesen</button>
          <input ref={datei} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && einlesen(e.target.files[0])} />
        </div>
        {meldung && <p className="klein" role="status">{meldung}</p>}
        {/* Im Haushalt nicht: Pläne werden dort nie gelöscht, sie kämen beim nächsten Abgleich zurück. */}
        {!gemeinsam.haushalt && (
          <button className="gefahr" onClick={() => {
            if (confirm('Alles auf den Anfang zurücksetzen? Pläne, eigene Rezepte und Einstellungen gehen verloren.')) aendere(() => startzustand())
          }}>Alles zurücksetzen</button>
        )}
      </section>
    </>
  )
}
