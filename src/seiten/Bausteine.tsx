import { useEffect, useState } from 'react'
import { bewerte } from '../lib/bewertung'
import { fotoUrl } from '../lib/foto'
import type { Zustand } from '../lib/speicher'
import { WERTE, type Foto, type Kategorie, type Rezept } from '../lib/typen'

const KATEGORIE_BILD: Record<Kategorie, string> = {
  nudeln: '🍝', huelsenfruechte: '🫘', fisch: '🐟', ofen: '🍲', gemuese: '🥕', besonders: '🍕',
}

function useFotoUrl(foto: Foto | undefined): string | null {
  const [url, setUrl] = useState<string | null>(foto?.art === 'frei' ? foto.url : null)
  useEffect(() => {
    let aktiv = true
    if (!foto) setUrl(null)
    else fotoUrl(foto).then((u) => aktiv && setUrl(u))
    return () => {
      aktiv = false
    }
  }, [foto])
  return url
}

/**
 * Foto eines Gerichts. Ohne Foto – oder wenn es nicht lädt, etwa ohne Netz – steht eine
 * farbige Kachel mit dem Symbol der Kategorie da, damit keine leere Fläche bleibt.
 */
export function GerichtBild({ rezept, klasse }: { rezept: Rezept | undefined; klasse: string }) {
  const url = useFotoUrl(rezept?.foto)
  const [kaputt, setKaputt] = useState(false)
  useEffect(() => setKaputt(false), [url])
  if (url && !kaputt) {
    return <img className={`bild ${klasse}`} src={url} alt="" loading="lazy" decoding="async" onError={() => setKaputt(true)} />
  }
  return (
    <div className={`bild ersatz ${klasse} kat-${rezept?.kategorie ?? 'leer'}`} aria-hidden="true">
      <span>{rezept ? KATEGORIE_BILD[rezept.kategorie] : '🍽️'}</span>
    </div>
  )
}

/** Urheber, Lizenz und Quelle – Pflicht bei Creative-Commons-Fotos. */
export function Bildnachweis({ foto }: { foto: Foto | undefined }) {
  if (foto?.art !== 'frei') return null
  return (
    <p className="nachweis">
      Foto: {foto.autor || 'unbekannt'} ·{' '}
      <a href={foto.seite} target="_blank" rel="noreferrer">{foto.lizenz}, {foto.quelle}</a>
    </p>
  )
}

interface LeisteProps {
  rezeptId: string
  z: Zustand
  aendere: (f: (z: Zustand) => Zustand) => void
  datum: string
  kompakt?: boolean
}

/** Je Person drei Gesichter. Nochmal antippen nimmt die Bewertung zurück. */
export function Bewertungsleiste({ rezeptId, z, aendere, datum, kompakt }: LeisteProps) {
  const eigene = z.bewertungen[rezeptId] ?? {}
  return (
    <div className={`bewertung${kompakt ? ' kompakt' : ''}`}>
      {z.einstellungen.personen.map((p) => (
        <div key={p.id} className="bewertung-zeile" role="group" aria-label={`Bewertung von ${p.name}`}>
          <span className="bewertung-name">{p.name}</span>
          {WERTE.map((w) => {
            const an = eigene[p.id]?.wert === w.wert
            return (
              <button
                key={w.wert}
                className="gesicht"
                aria-pressed={an}
                aria-label={`${p.name}: ${w.name}`}
                title={w.name}
                onClick={() => aendere((alt) => ({ ...alt, bewertungen: bewerte(alt.bewertungen, rezeptId, p.id, an ? null : w.wert, datum) }))}
              >
                {w.zeichen}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** Kurzform für Listen: „😋 2 · 😖 1“. */
export function BewertungKurz({ rezeptId, z }: { rezeptId: string; z: Zustand }) {
  const werte = Object.values(z.bewertungen[rezeptId] ?? {})
  if (werte.length === 0) return null
  return (
    <span className="bewertung-kurz" aria-label="Bewertungen">
      {WERTE.map((w) => {
        const n = werte.filter((x) => x.wert === w.wert).length
        return n > 0 ? <span key={w.wert}>{w.zeichen} {n}</span> : null
      })}
    </span>
  )
}
