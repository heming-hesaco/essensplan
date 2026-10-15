import { useEffect, useMemo, useState } from 'react'
import { lade, speichere, type Zustand } from './lib/speicher'
import { heuteIso, letzterSamstag, naechsterSamstag } from './lib/woche'
import { baueKatalog } from './lib/zutaten'
import { Einkauf } from './seiten/Einkauf'
import { Einstellungen } from './seiten/Einstellungen'
import { PlanSeite } from './seiten/Plan'
import { Rezepte } from './seiten/Rezepte'

type Bereich = 'plan' | 'einkauf' | 'rezepte' | 'einstellungen'

const BEREICHE: { id: Bereich; name: string; zeichen: string }[] = [
  { id: 'plan', name: 'Woche', zeichen: '🗓️' },
  { id: 'einkauf', name: 'Einkauf', zeichen: '🧺' },
  { id: 'rezepte', name: 'Rezepte', zeichen: '📖' },
  { id: 'einstellungen', name: 'Einstellungen', zeichen: '⚙️' },
]

/** Läuft die Woche schon und ist geplant, zeigen wir sie; sonst die nächste. */
function startWoche(z: Zustand): string {
  const heute = heuteIso()
  const laufend = letzterSamstag(heute)
  return z.plaene[laufend] ? laufend : naechsterSamstag(heute)
}

export interface SeitenProps {
  z: Zustand
  aendere: (f: (z: Zustand) => Zustand) => void
}

export function App() {
  const [z, setZ] = useState<Zustand>(lade)
  const [bereich, setBereich] = useState<Bereich>('plan')
  const [woche, setWoche] = useState(() => startWoche(z))
  const [speicherOk, setSpeicherOk] = useState(true)
  const katalog = useMemo(() => baueKatalog(z.katalog), [z.katalog])

  useEffect(() => {
    setSpeicherOk(speichere(z))
  }, [z])

  const aendere = (f: (z: Zustand) => Zustand) => setZ((alt) => f(alt))

  return (
    <div className="app">
      <main className="inhalt">
        {!speicherOk && (
          <p className="warnung">
            Speichern im Browser klappt gerade nicht (privates Fenster?). Änderungen gehen beim
            Schließen verloren.
          </p>
        )}
        {bereich === 'plan' && (
          <PlanSeite
            z={z} aendere={aendere} katalog={katalog} woche={woche} setWoche={setWoche}
            zumEinkauf={() => setBereich('einkauf')}
          />
        )}
        {bereich === 'einkauf' && (
          <Einkauf z={z} aendere={aendere} katalog={katalog} woche={woche} setWoche={setWoche} />
        )}
        {bereich === 'rezepte' && <Rezepte z={z} aendere={aendere} katalog={katalog} />}
        {bereich === 'einstellungen' && <Einstellungen z={z} aendere={aendere} katalog={katalog} />}
      </main>
      <nav className="leiste" aria-label="Bereiche">
        {BEREICHE.map((b) => (
          <button
            key={b.id}
            className={bereich === b.id ? 'aktiv' : ''}
            aria-current={bereich === b.id ? 'page' : undefined}
            onClick={() => setBereich(b.id)}
          >
            <span aria-hidden="true">{b.zeichen}</span>
            {b.name}
          </button>
        ))}
      </nav>
    </div>
  )
}
