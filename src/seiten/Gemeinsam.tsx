import { useState } from 'react'
import type { Gemeinsam } from '../lib/useGemeinsam'

const STATUS = {
  aus: 'Nicht verbunden',
  laedt: 'Verbindet …',
  verbunden: 'Verbunden – Änderungen erscheinen sofort auf dem anderen Handy',
  offline: 'Kein Netz – Änderungen werden nachgeschickt',
} as const

export function GemeinsamBereich({ g }: { g: Gemeinsam }) {
  const [mail, setMail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [name, setName] = useState('Unser Haushalt')
  const [code, setCode] = useState('')
  const [meldung, setMeldung] = useState('')
  const [laeuft, setLaeuft] = useState(false)

  const mit = (f: () => Promise<unknown>) => async () => {
    setLaeuft(true)
    setMeldung('')
    try {
      await f()
    } finally {
      setLaeuft(false)
    }
  }

  if (!g.eingerichtet) {
    return (
      <section className="karte formular">
        <h2>Gemeinsam nutzen</h2>
        <p className="klein">In dieser Fassung ist keine Datenbank eingerichtet. Alles bleibt auf diesem Gerät.</p>
      </section>
    )
  }

  if (!g.email) {
    return (
      <section className="karte formular">
        <h2>Gemeinsam nutzen</h2>
        <p className="klein">
          Mit einem Konto je Person seht ihr auf beiden Handys denselben Plan und dieselbe
          Einkaufsliste. Was einer abhakt, ist beim anderen sofort abgehakt.
        </p>
        <form className="formular" onSubmit={(e) => { e.preventDefault(); mit(() => g.anmelden(mail, passwort))() }}>
          <label>E-Mail<input type="email" autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} required /></label>
          <label>Passwort<input type="password" autoComplete="current-password" minLength={8} value={passwort} onChange={(e) => setPasswort(e.target.value)} required /></label>
          <div className="aktionen">
            <button type="submit" className="haupt" disabled={laeuft}>Anmelden</button>
            <button
              type="button"
              disabled={laeuft || !mail || passwort.length < 8}
              onClick={mit(async () => {
                const r = await g.registrieren(mail, passwort)
                if (r === 'bestaetigen') setMeldung('Fast geschafft: Bitte den Link in der Mail bestätigen und dann hier anmelden.')
              })}
            >
              Konto anlegen
            </button>
          </div>
          <p className="klein">Passwort mindestens 8 Zeichen.</p>
        </form>
        {meldung && <p className="klein" role="status">{meldung}</p>}
        {g.fehler && <p className="warnung" role="alert">{g.fehler}</p>}
      </section>
    )
  }

  if (!g.haushalt) {
    return (
      <section className="karte formular">
        <h2>Gemeinsam nutzen</h2>
        <p className="klein">Angemeldet als {g.email}. Jetzt einen Haushalt anlegen oder einem beitreten.</p>
        <fieldset>
          <legend>Neuen Haushalt anlegen</legend>
          <p className="klein">Der Stand auf diesem Handy – Rezepte, Pläne, Einstellungen – wird der Anfang.</p>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
          <button className="haupt" disabled={laeuft} onClick={mit(() => g.anlegen(name))}>Haushalt anlegen</button>
        </fieldset>
        <fieldset>
          <legend>Mit Einladungscode beitreten</legend>
          <p className="klein">Der Stand auf diesem Handy wird durch den des Haushalts ersetzt.</p>
          <label>Einladungscode<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" placeholder="z. B. K7MP4QXA" /></label>
          <button disabled={laeuft || code.trim().length < 8} onClick={mit(() => g.beitreten(code))}>Beitreten</button>
        </fieldset>
        {g.fehler && <p className="warnung" role="alert">{g.fehler}</p>}
        <button className="still" onClick={mit(g.abmelden)}>Abmelden</button>
      </section>
    )
  }

  const h = g.haushalt
  const teilen = async () => {
    const text = `Tritt unserem Essensplan bei: Einstellungen → Gemeinsam nutzen → Einladungscode ${h.einladungscode}`
    try {
      if (navigator.share) await navigator.share({ title: 'Essensplan', text })
      else {
        await navigator.clipboard.writeText(h.einladungscode)
        setMeldung('Code kopiert.')
      }
    } catch {
      // abgebrochen
    }
  }

  return (
    <section className="karte formular">
      <h2>Gemeinsam nutzen</h2>
      <p className="klein" role="status">
        <span className={`punkt ${g.verbindung}`} aria-hidden="true" /> {STATUS[g.verbindung]}
        {g.wartend > 0 && ` · ${g.wartend} Änderungen warten`}
      </p>
      <p><strong>{h.name || 'Haushalt'}</strong> · {h.mitglieder === 1 ? 'nur dieses Konto' : `${h.mitglieder} Konten`}</p>
      {h.einladungscode && (
        <div className="code-zeile">
          <span className="klein">Einladungscode fürs zweite Handy</span>
          <code className="code">{h.einladungscode}</code>
          <button onClick={teilen}>Code teilen</button>
        </div>
      )}
      {meldung && <p className="klein" role="status">{meldung}</p>}
      {g.fehler && <p className="warnung" role="alert">{g.fehler}</p>}
      <p className="klein">Angemeldet als {g.email}.</p>
      <div className="aktionen">
        <button
          onClick={mit(async () => {
            if (g.wartend > 0 && !confirm(`${g.wartend} Änderungen sind noch nicht übertragen und gehen beim Abmelden verloren. Trotzdem abmelden?`)) return
            await g.abmelden()
          })}
        >
          Abmelden
        </button>
        <button
          className="gefahr"
          onClick={mit(async () => {
            const letzter = h.mitglieder <= 1
            if (!confirm(letzter
              ? 'Ihr seid das letzte Konto im Haushalt. Beim Verlassen wird er mit allen gemeinsamen Daten gelöscht. Der Stand bleibt auf diesem Handy. Fortfahren?'
              : 'Haushalt verlassen? Der Stand bleibt auf diesem Handy, wird aber nicht mehr abgeglichen.')) return
            await g.verlassen()
          })}
        >
          Haushalt verlassen
        </button>
      </div>
    </section>
  )
}
