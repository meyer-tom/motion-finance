"use client"

import { WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  if (!isOffline) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 left-0 z-[100] flex items-center justify-center gap-2 bg-slate-800 px-4 py-2 text-white dark:bg-slate-900">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <p className="text-xs">
        Vous êtes hors ligne — lecture seule des données en cache
      </p>
    </div>
  )
}
