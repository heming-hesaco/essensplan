import { supabase } from './supabase'
import type { Foto } from './typen'

const BUCKET = 'fotos'
/** Signierte Links gelten eine Woche; gemerkt werden sie sechs Tage, damit keiner abläuft, während er angezeigt wird. */
const GUELTIG_S = 7 * 24 * 3600
const MERKEN_MS = 6 * 24 * 3600 * 1000
const SPEICHER = 'essensplan:fotolinks'

type Merkliste = Record<string, { url: string; bis: number }>

function ladeMerkliste(): Merkliste {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER) ?? '{}') as Merkliste
  } catch {
    return {}
  }
}

const merkliste = ladeMerkliste()
const laufend = new Map<string, Promise<string | null>>()

/** Adresse eines Fotos. Eigene Fotos liegen privat und brauchen einen signierten Link. */
export async function fotoUrl(foto: Foto): Promise<string | null> {
  if (foto.art === 'frei') return foto.url
  const gemerkt = merkliste[foto.pfad]
  if (gemerkt && gemerkt.bis > Date.now()) return gemerkt.url
  if (!supabase) return null
  const client = supabase
  const offen = laufend.get(foto.pfad)
  if (offen) return offen
  const anfrage = client.storage.from(BUCKET).createSignedUrl(foto.pfad, GUELTIG_S).then(({ data }) => {
    laufend.delete(foto.pfad)
    if (!data?.signedUrl) return null
    merkliste[foto.pfad] = { url: data.signedUrl, bis: Date.now() + MERKEN_MS }
    try {
      localStorage.setItem(SPEICHER, JSON.stringify(merkliste))
    } catch {
      // ohne Speicher wird der Link beim nächsten Start neu geholt
    }
    return data.signedUrl
  })
  laufend.set(foto.pfad, anfrage)
  return anfrage
}

/**
 * Verkleinert ein Foto vom Handy auf höchstens 1000 Pixel Kantenlänge (JPEG). Aus 4 MB
 * werden so etwa 100 kB – genug für den Bildschirm, schnell geladen auch im Laden.
 */
export async function verkleinere(datei: File, kante = 1000): Promise<Blob> {
  const bild = await createImageBitmap(datei)
  const faktor = Math.min(1, kante / Math.max(bild.width, bild.height))
  const leinwand = document.createElement('canvas')
  leinwand.width = Math.round(bild.width * faktor)
  leinwand.height = Math.round(bild.height * faktor)
  leinwand.getContext('2d')!.drawImage(bild, 0, 0, leinwand.width, leinwand.height)
  bild.close()
  return new Promise((ok, fehler) =>
    leinwand.toBlob((b) => (b ? ok(b) : fehler(new Error('Das Foto ließ sich nicht umwandeln.'))), 'image/jpeg', 0.8),
  )
}

/** Lädt ein Foto in den Ordner des Haushalts und liefert den Pfad. */
export async function ladeFotoHoch(haushaltId: string, rezeptId: string, blob: Blob): Promise<string> {
  if (!supabase) throw new Error('Fotos brauchen den gemeinsamen Haushalt.')
  const sicher = rezeptId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 60) || 'gericht'
  const pfad = `${haushaltId}/${sicher}-${Date.now().toString(36)}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(pfad, blob, { contentType: 'image/jpeg' })
  if (error) throw new Error(`Hochladen fehlgeschlagen: ${error.message}`)
  return pfad
}
