import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

/**
 * Retourne la session de l'utilisateur courant.
 * React.cache() déduplique l'appel DB sur l'ensemble du render cycle :
 * layout + server actions partagent le même résultat, une seule requête DB.
 */
export const getAuthSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})
