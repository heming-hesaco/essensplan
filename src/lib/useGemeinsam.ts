import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import {
  aenderungen, ausZeilen, leererZustand, vorgangZuZeile, wendeAn, zeileZuVorgang, type Vorgang, type Zeilen,
} from './abgleich'
import type { Zustand } from './speicher'
import { supabase } from './supabase'
import { einreihen, ladeWarteschlange, speichereWarteschlange, wartetAuf } from './warteschlange'
import { heuteIso, plusTage } from './woche'

export interface Haushalt {
  id: string
  name: string
  einladungscode: string
  /** null, solange nicht vom Server geladen – eine geratene Zahl stünde sonst in der Lösch-Warnung. */
  mitglieder: number | null
}

export type Verbindung = 'aus' | 'laedt' | 'verbunden' | 'offline'

interface Optionen {
  zRef: MutableRefObject<Zustand>
  setzeVomServer: (z: Zustand) => void
}

/** Wochen, deren Haken geladen werden. Ältere Einkaufslisten braucht niemand mehr. */
const HAKEN_TAGE = 35

/** Ein Fehler ohne Datenbank-Code ist ein Netzfehler: später noch einmal versuchen. */
function istNetzfehler(e: { code?: string; message?: string } | null): boolean {
  return !!e && !e.code
}

export function useGemeinsam({ zRef, setzeVomServer }: Optionen) {
  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [haushalt, setHaushalt] = useState<Haushalt | null>(null)
  /** Für welches Konto schon feststeht, ob es einen Haushalt hat. */
  const [geprueftFuer, setGeprueftFuer] = useState<string | null>(null)
  const [verbindung, setVerbindung] = useState<Verbindung>('aus')
  const [wartend, setWartend] = useState(() => ladeWarteschlange().length)
  const [fehler, setFehler] = useState('')
  const schlange = useRef<Vorgang[]>(ladeWarteschlange())
  const sendetGerade = useRef(false)
  const haushaltId = haushalt?.id ?? null
  const idRef = useRef<string | null>(null)
  idRef.current = haushaltId

  const setzeSchlange = (liste: Vorgang[]) => {
    schlange.current = liste
    speichereWarteschlange(liste)
    setWartend(liste.length)
  }

  /** Schickt die Warteschlange ab, gleichartige Zeilen gebündelt. Liefert true, wenn sie leer ist. */
  const senden = useCallback(async (): Promise<boolean> => {
    const id = idRef.current
    if (!supabase || !id) return false
    if (sendetGerade.current) return false
    sendetGerade.current = true
    try {
      while (schlange.current.length > 0) {
        const erster = schlange.current[0]
        let anzahl = 1
        if (erster.tabelle !== 'haushalte') {
          while (anzahl < 200 && schlange.current[anzahl]?.tabelle === erster.tabelle) anzahl++
        }
        const paket = schlange.current.slice(0, anzahl)
        const zeilen = paket.map((v) => vorgangZuZeile(v, id))
        const { tabelle, konflikt } = zeilen[0]
        const { error } =
          tabelle === 'haushalte'
            ? await supabase.from('haushalte').update(zeilen[0].zeile).eq('id', id)
            : await supabase.from(tabelle).upsert(zeilen.map((z) => z.zeile), { onConflict: konflikt })
        if (error) {
          if (istNetzfehler(error)) {
            setVerbindung('offline')
            return false
          }
          // Die Datenbank lehnt ab (etwa eine zu lange Eingabe): nicht endlos wiederholen.
          setFehler(`Eine Änderung wurde nicht gespeichert: ${error.message}`)
        }
        setzeSchlange(schlange.current.filter((v) => !paket.includes(v)))
      }
      setVerbindung('verbunden')
      return true
    } finally {
      sendetGerade.current = false
    }
  }, [])

  /** Holt den ganzen Stand. Was noch in der Warteschlange steht, wird darübergelegt. */
  const ladeAlles = useCallback(async () => {
    const id = idRef.current
    if (!supabase || !id) return
    await senden()
    const grenze = plusTage(heuteIso(), -HAKEN_TAGE)
    const [h, r, p, k, e, m] = await Promise.all([
      supabase.from('haushalte').select('name, einladungscode, einstellungen, raster, fruehstueck, katalog').eq('id', id).maybeSingle(),
      supabase.from('rezepte').select('id, daten, geloescht').eq('haushalt_id', id),
      supabase.from('plaene').select('woche, tage').eq('haushalt_id', id),
      supabase.from('haken').select('woche, art, schluessel, an').eq('haushalt_id', id).gte('woche', grenze),
      supabase.from('extras').select('id, woche, text, laden, geloescht').eq('haushalt_id', id).gte('woche', grenze),
      supabase.from('mitglieder').select('user_id', { count: 'exact', head: true }).eq('haushalt_id', id),
    ])
    const fehlerhaft = [h, r, p, k, e].find((x) => x.error)
    if (fehlerhaft?.error) {
      setVerbindung(istNetzfehler(fehlerhaft.error) ? 'offline' : 'verbunden')
      if (!istNetzfehler(fehlerhaft.error)) setFehler(fehlerhaft.error.message)
      return
    }
    if (!h.data) {
      // Haushalt gibt es nicht mehr (der andere hat ihn als Letzter verlassen).
      setHaushalt(null)
      return
    }
    let z = ausZeilen({
      haushalt: h.data,
      rezepte: r.data ?? [],
      plaene: p.data ?? [],
      haken: k.data ?? [],
      extras: e.data ?? [],
    } as Zeilen)
    for (const v of schlange.current) z = wendeAn(z, v)
    setzeVomServer(z)
    setHaushalt({ id, name: h.data.name, einladungscode: h.data.einladungscode, mitglieder: m.error ? null : m.count })
    setVerbindung('verbunden')
  }, [senden, setzeVomServer])

  // Anmeldung: geladen wird je Nutzer, nicht je Sitzungsobjekt – beim Zurückkehren in
  // den Tab meldet supabase-js dieselbe Sitzung als neues Objekt.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null)
      setEmail(data.session?.user.email ?? null)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, sitzung) => {
      setUserId(sitzung?.user.id ?? null)
      setEmail(sitzung?.user.email ?? null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Zu welchem Haushalt gehört das Konto? Scheitert die Frage am Netz, wird sie beim
  // nächsten „online“ wiederholt – sonst bliebe der Abgleich bis zum Neuladen aus.
  const [versuch, setVersuch] = useState(0)
  useEffect(() => {
    if (!supabase || !userId) {
      setHaushalt(null)
      setVerbindung('aus')
      return
    }
    let abgebrochen = false
    setVerbindung('laedt')
    supabase.from('mitglieder').select('haushalt_id').eq('user_id', userId).maybeSingle().then(({ data, error }) => {
      if (abgebrochen) return
      if (error) {
        if (istNetzfehler(error)) setVerbindung('offline')
        else {
          setFehler(error.message)
          setVerbindung('aus')
        }
        return
      }
      setGeprueftFuer(userId)
      if (data) setHaushalt((alt) => (alt?.id === data.haushalt_id ? alt : { id: data.haushalt_id, name: '', einladungscode: '', mitglieder: null }))
      else {
        setHaushalt(null)
        setVerbindung('aus')
      }
    })
    return () => {
      abgebrochen = true
    }
  }, [userId, versuch])

  useEffect(() => {
    if (!userId || geprueftFuer === userId) return
    const nochmal = () => setVersuch((v) => v + 1)
    window.addEventListener('online', nochmal)
    return () => window.removeEventListener('online', nochmal)
  }, [userId, geprueftFuer])

  // Im Haushalt: alles laden, Änderungen des anderen Handys mitlesen, bei Rückkehr abgleichen.
  useEffect(() => {
    if (!supabase || !haushaltId) return
    const client = supabase
    ladeAlles()

    const kanal = client.channel(`haushalt-${haushaltId}`)
    for (const tabelle of ['rezepte', 'plaene', 'haken', 'extras', 'haushalte'] as const) {
      kanal.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tabelle, filter: tabelle === 'haushalte' ? `id=eq.${haushaltId}` : `haushalt_id=eq.${haushaltId}` },
        (ereignis) => {
          const v = zeileZuVorgang(tabelle, ereignis.new as Record<string, unknown>)
          // Wartet hier selbst noch eine Änderung an derselben Zeile, gewinnt sie.
          if (!v || wartetAuf(schlange.current, v)) return
          setzeVomServer(wendeAn(zRef.current, v))
        },
      )
    }
    kanal.subscribe((status) => {
      // Nach einer Unterbrechung kann ein Ereignis gefehlt haben.
      if (status === 'SUBSCRIBED') ladeAlles()
    })

    const zurueck = () => {
      if (document.visibilityState === 'visible') ladeAlles()
    }
    window.addEventListener('online', ladeAlles)
    document.addEventListener('visibilitychange', zurueck)
    return () => {
      client.removeChannel(kanal)
      window.removeEventListener('online', ladeAlles)
      document.removeEventListener('visibilitychange', zurueck)
    }
  }, [haushaltId, ladeAlles, setzeVomServer, zRef])

  /** Eine lokale Änderung: einreihen und abschicken. */
  const melde = useCallback((alt: Zustand, neu: Zustand) => {
    if (!idRef.current) return
    const v = aenderungen(alt, neu)
    if (v.length === 0) return
    setzeSchlange(einreihen(schlange.current, v))
    senden()
  }, [senden])

  const anmelden = async (mail: string, passwort: string) => {
    setFehler('')
    const { error } = await supabase!.auth.signInWithPassword({ email: mail.trim(), password: passwort })
    if (error) setFehler(error.message === 'Invalid login credentials' ? 'E-Mail oder Passwort stimmt nicht.' : error.message)
  }

  const registrieren = async (mail: string, passwort: string): Promise<'angemeldet' | 'bestaetigen' | 'fehler'> => {
    setFehler('')
    const { data, error } = await supabase!.auth.signUp({
      email: mail.trim(), password: passwort, options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setFehler(error.message)
      return 'fehler'
    }
    return data.session ? 'angemeldet' : 'bestaetigen'
  }

  const abmelden = async () => {
    setzeSchlange([])
    await supabase!.auth.signOut()
  }

  /** Neuer Haushalt: der Stand dieses Geräts wird sein Anfang. */
  const anlegen = async (name: string) => {
    setFehler('')
    const { data, error } = await supabase!.rpc('haushalt_anlegen', { p_name: name })
    if (error) return setFehler(error.message)
    setzeSchlange(einreihen([], aenderungen(leererZustand(), zRef.current)))
    setHaushalt({ id: data as string, name, einladungscode: '', mitglieder: null })
  }

  /** Beitreten: der Stand dieses Geräts wird durch den des Haushalts ersetzt. */
  const beitreten = async (code: string) => {
    setFehler('')
    const { data, error } = await supabase!.rpc('haushalt_beitreten', { p_code: code })
    if (error) return setFehler(error.message)
    setzeSchlange([])
    setHaushalt({ id: data as string, name: '', einladungscode: '', mitglieder: null })
  }

  const verlassen = async () => {
    setFehler('')
    const { error } = await supabase!.rpc('haushalt_verlassen')
    if (error) return setFehler(error.message)
    setzeSchlange([])
    setHaushalt(null)
    setVerbindung('aus')
  }

  const umbenennen = async (name: string) => {
    if (!haushaltId || !name.trim()) return
    const { error } = await supabase!.from('haushalte').update({ name: name.trim() }).eq('id', haushaltId)
    if (error) setFehler(error.message)
    else setHaushalt((h) => (h ? { ...h, name: name.trim() } : h))
  }

  return {
    eingerichtet: supabase !== null,
    email, haushalt, verbindung, wartend, fehler,
    haushaltGeprueft: userId !== null && geprueftFuer === userId,
    melde, anmelden, registrieren, abmelden, anlegen, beitreten, verlassen, umbenennen,
    neuLaden: ladeAlles,
  }
}

export type Gemeinsam = ReturnType<typeof useGemeinsam>

export function aenderungenText(n: number): string {
  return n === 1 ? '1 Änderung' : `${n} Änderungen`
}
