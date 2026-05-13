const STATIC_CACHE = "motion-static-v3"
const DYNAMIC_CACHE = "motion-dynamic-v3"

// ── Install : pré-cache uniquement la racine publique ────────────────────────
// Ne pas pré-cacher les routes protégées (/dashboard, etc.) — elles redirigent
// vers /login en tant qu'invité, ce qui polluerait le cache et peut faire
// échouer cache.addAll() si la chaîne de redirections retourne une erreur.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(["/"]))
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
  // mutations API). cache.put() rejette les non-GET avec un TypeError et
  // ferait échouer silencieusement toute soumission de formulaire.
  if (request.method !== "GET") return

  // Cache First — assets Next.js versionnés et icônes (immuables)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Network First — navigation HTML (offline : fallback sur cache)
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }
})

// ── Stratégie Cache First ─────────────────────────────────────────────────────
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

// ── Stratégie Network First ───────────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.mode === "navigate") {
      const fallback = await caches.match("/")
      if (fallback) return fallback
    }
    return new Response("Contenu non disponible hors ligne", { status: 503 })
  }
}
