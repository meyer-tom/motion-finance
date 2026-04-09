"use client"

import { Trophy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Chargement dynamique pour ne pas alourdir le bundle initial
const loadConfetti = () => import("canvas-confetti")

// Couleurs violet + vert cohérentes avec les tokens CSS du projet
const CONFETTI_COLORS = ["#7c3aed", "#10b981", "#a78bfa", "#34d399"]

interface GoalCompletionCelebrationProps {
  readonly isCompleted: boolean
  /**
   * Si `true`, la célébration ne se déclenche qu'une seule fois même si
   * `isCompleted` repasse à `false` puis revient à `true`.
   * Mettre à `true` en production sur le vrai composant objectif.
   * @default false
   */
  readonly once?: boolean
}

export function GoalCompletionCelebration({
  isCompleted,
  once = false,
}: GoalCompletionCelebrationProps) {
  const [visible, setVisible] = useState(false)
  const hasFiredRef = useRef(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isCompleted) {
      return
    }
    if (once && hasFiredRef.current) {
      return
    }

    hasFiredRef.current = true

    // setTimeout(0) évite d'appeler setState synchronement dans l'effet
    // ce qui provoquerait des re-renders en cascade (react-hooks/set-state-in-effect)
    const visibleTimer = setTimeout(() => setVisible(true), 0)

    // Vibration mobile
    navigator.vibrate?.([100, 50, 200])

    // Confettis
    let cancelled = false
    const animationEnd = Date.now() + 2000

    loadConfetti().then(({ default: confetti }) => {
      if (cancelled) {
        return
      }

      // Burst initial centré
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.6 },
        colors: CONFETTI_COLORS,
        startVelocity: 45,
      })

      // Pluie douce pendant 2,5 s depuis les côtés
      function rain() {
        if (cancelled || Date.now() > animationEnd) {
          return
        }

        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 },
          colors: CONFETTI_COLORS,
        })
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 },
          colors: CONFETTI_COLORS,
        })

        rafRef.current = setTimeout(rain, 80)
      }

      rain()
    })

    // Auto-dismiss à 2,5 s
    dismissTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, 2500)

    return () => {
      cancelled = true
      clearTimeout(visibleTimer)
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
      }
      if (rafRef.current) {
        clearTimeout(rafRef.current)
      }
    }
  }, [isCompleted, once])

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-xl">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-income)/15">
          <Trophy className="size-5 text-(--color-income)" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">
            Objectif atteint !
          </span>
          <span className="text-muted-foreground text-xs">
            Félicitations, vous avez atteint votre objectif.
          </span>
        </div>
        <Badge className="ml-1 shrink-0" variant="success">
          Complété
        </Badge>
      </div>
    </div>
  )
}
