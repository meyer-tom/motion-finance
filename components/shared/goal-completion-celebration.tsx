"use client"

import { useEffect, useRef } from "react"

const loadConfetti = () => import("canvas-confetti")

const CONFETTI_COLORS = ["#7c3aed", "#10b981", "#a78bfa", "#34d399"]

interface GoalCompletionCelebrationProps {
  readonly isCompleted: boolean
}

export function GoalCompletionCelebration({
  isCompleted,
}: GoalCompletionCelebrationProps) {
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isCompleted) {
      return
    }

    navigator.vibrate?.([100, 50, 200])

    let cancelled = false
    const animationEnd = Date.now() + 2000

    loadConfetti().then(({ default: confetti }) => {
      if (cancelled) {
        return
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.6 },
        colors: CONFETTI_COLORS,
        startVelocity: 45,
      })

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

    return () => {
      cancelled = true
      if (rafRef.current) {
        clearTimeout(rafRef.current)
      }
    }
  }, [isCompleted])

  return null
}
