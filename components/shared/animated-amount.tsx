"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type Variant = "income" | "expense" | "transfer" | "neutral"

const variantClass: Record<Variant, string> = {
  income: "text-[var(--color-income)]",
  expense: "text-[var(--color-expense)]",
  transfer: "text-[var(--color-transfer)]",
  neutral: "",
}

interface AnimatedAmountProps {
  className?: string
  currency: string
  value: number
  variant?: Variant
}

function formatAmount(value: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Cubic ease-out: decelerates toward the end
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}

export function AnimatedAmount({
  value,
  currency,
  className,
  variant = "neutral",
}: AnimatedAmountProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const prevValueRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = prevValueRef.current
    const end = value
    const duration = 800
    const startTime = performance.now()

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = start + (end - start) * easeOut(progress)

      if (spanRef.current) {
        spanRef.current.textContent = formatAmount(current, currency)
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevValueRef.current = end
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, currency])

  return (
    <span
      className={cn("tabular-nums", variantClass[variant], className)}
      ref={spanRef}
    >
      {formatAmount(value, currency)}
    </span>
  )
}
