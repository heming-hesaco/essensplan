/// <reference types="node" />
import { lookup } from 'node:dns/promises'
import { holeRezept } from './_holeRezept.js'

/**
 * GET /api/rezept-import?url=… – holt eine Rezeptseite und gibt das Rezept als JSON zurück.
 * Der Browser darf fremde Seiten nicht selbst lesen; deshalb dieser kleine Umweg über den
 * Server. Gespeichert wird nichts.
 */
export async function GET(request: Request): Promise<Response> {
  const link = new URL(request.url).searchParams.get('url') ?? ''
  const ergebnis = await holeRezept(link, {
    lookup: (host) => lookup(host, { all: true }),
    fetch: (url, init) => fetch(url, init),
  })
  const body = ergebnis.status === 200 ? ergebnis.rezept : { fehler: ergebnis.fehler }
  return Response.json(body, { status: ergebnis.status, headers: { 'cache-control': 'no-store' } })
}
