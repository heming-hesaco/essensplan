import { kurzDatum, plusTage } from '../lib/woche'

export function WochenKopf({ woche, setWoche, titel }: { woche: string; setWoche: (w: string) => void; titel: string }) {
  return (
    <header className="kopf">
      <h1>{titel}</h1>
      <div className="wochenwahl">
        <button className="rund" aria-label="Vorige Woche" onClick={() => setWoche(plusTage(woche, -7))}>‹</button>
        <span>{kurzDatum(woche)} – {kurzDatum(plusTage(woche, 6))}</span>
        <button className="rund" aria-label="Nächste Woche" onClick={() => setWoche(plusTage(woche, 7))}>›</button>
      </div>
    </header>
  )
}
