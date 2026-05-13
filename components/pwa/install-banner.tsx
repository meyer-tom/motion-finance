"use client"

import { Download, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

const STORAGE_KEY = "pwa-install-dismissed"
const SHOW_DELAY_MS = 2000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallBanner() {
  const isMobile = useIsMobile()
  const [visible, setVisible] = useState(false)
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Déjà installé en mode standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return
    }
    // Déjà rejeté par l'utilisateur
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      promptRef.current = e as BeforeInstallPromptEvent
      timerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (!promptRef.current) {
      return
    }
    await promptRef.current.prompt()
    const { outcome } = await promptRef.current.userChoice
    if (outcome === "accepted") {
      dismiss()
    }
  }

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  if (!(isMobile && visible)) {
    return null
  }

  return (
    <div className="fixed right-3 bottom-[calc(56px+env(safe-area-inset-bottom)+0.75rem)] left-3 z-50 flex items-center gap-3 rounded-xl border border-violet-200 bg-white px-4 py-3 shadow-lg dark:border-violet-800/40 dark:bg-[#1a1025]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
        <Download className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 text-sm dark:text-white">
          Installer Motion Finance
        </p>
        <p className="text-slate-500 text-xs dark:text-slate-400">
          Accès rapide depuis votre écran d'accueil
        </p>
      </div>
      <button
        className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white text-xs transition-opacity hover:opacity-90 active:opacity-75"
        onClick={handleInstall}
        type="button"
      >
        Installer
      </button>
      <button
        aria-label="Fermer"
        className="shrink-0 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
        onClick={dismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
