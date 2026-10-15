import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const schluessel = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Fehlen die Zugangsdaten, läuft die App wie bisher nur auf dem Gerät – sie soll
 * nicht an einer fehlenden Einstellung scheitern.
 */
export const supabase: SupabaseClient | null =
  url && schluessel ? createClient(url, schluessel, { auth: { persistSession: true, autoRefreshToken: true } }) : null
