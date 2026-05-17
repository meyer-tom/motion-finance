const STATIC_CACHE = "motion-static-v5"
const DYNAMIC_CACHE = "motion-dynamic-v5"
const OFFLINE_URL = "/offline.html"

// ── Install : pré-cache la racine et la page offline ────────────────────────
// Ne pas pré-cacher les routes protégées (/dashboard, etc.) — elles redirigent
// vers /login en tant qu'invité, ce qui polluerait le cache.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(["/", OFFLINE_URL]))
      .then(() => self.skipWaiting())
  )
})

// ── Activate : nettoie les anciens caches ────────────────────────────────────
self.addEventListener("activate", (event) => {
  const VALID = [STATIC_CACHE, DYNAMIC_CACHE]
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !VALID.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch : routing des stratégies de cache ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-HTTP (extensions, data:, etc.)
  if (!url.protocol.startsWith("http")) return

  // Ne jamais intercepter les requêtes non-GET (POST auth, Server Actions,
  // mutations API). cache.put() rejette les non-GET avec un TypeError.
  if (request.method !== "GET") return

  // Stale-While-Revalidate — assets Next.js versionnés
  // (les hashes changent à chaque build, SWR garantit la fraîcheur)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
    return
  }

  // Cache First — icônes PWA (immuables)
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Network First — navigation HTML (offline : fallback page dédiée)
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request))
    return
  }
})

// ── Stale-While-Revalidate ───────────────────────────────────────────────────
// Sert depuis le cache immédiatement, met à jour en arrière-plan.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  // Si on a un cache, le servir immédiatement ; sinon attendre le réseau
  return cached ?? fetchPromise
}

// ── Cache First ───────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response("Ressource non disponible hors ligne", { status: 503 })
  }
}

// ── Network First avec fallback offline propre ────────────────────────────────
async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Fallback : page mise en cache précédemment
    const cached = await caches.match(request)
    if (cached) return cached

    // Dernier recours : page offline dédiée
    const offline = await caches.match(OFFLINE_URL)
    return (
      offline ??
      new Response(
        '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Hors ligne</title></head><body><h1>Application hors ligne</h1></body></html>',
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      )
    )
  }
}
