"use client"

import { useEffect } from "react"

let didRegister = false

export function PwaRegister() {
  useEffect(() => {
    if (didRegister || !("serviceWorker" in navigator)) {
      return
    }
    didRegister = true
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Échec non critique : l'app reste fonctionnelle sans SW
    })
  }, [])

  return null
}
