// Hält die App offline benutzbar – wichtig für die Einkaufsliste im Laden ohne Netz.
// Seiten: erst Netz, dann Cache. Gebaute Dateien tragen einen Hash im Namen und
// ändern sich nie, deshalb dort erst Cache, dann Netz.
const CACHE = 'essensplan-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.webmanifest', '/icon.svg'])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const kopie = res.clone()
          if (res.ok) caches.open(CACHE).then((c) => c.put('/', kopie))
          return res
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  e.respondWith(
    caches.match(req).then(
      (treffer) =>
        treffer ??
        fetch(req).then((res) => {
          if (res.ok) {
            const kopie = res.clone()
            caches.open(CACHE).then((c) => c.put(req, kopie))
          }
          return res
        }),
    ),
  )
})
