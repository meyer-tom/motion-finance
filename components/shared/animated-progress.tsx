"use client"

import { useEffect, useRef, useState } from "react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type Variant = "green" | "orange" | "red" | "accent" | "auto"

const variantColor: Record<Exclude<Variant, "auto">, string> = {
  green: "var(--color-income)",
  orange: "oklch(0.75 0.17 60)",
  red: "var(--color-expense)",
  accent: "var(--color-accent)",
}

function resolveColor(variant: Variant, value: number): string {
  if (variant !== "auto") {
    return variantColor[variant]
  }
  if (value >= 90) {
    return variantColor.red
  }
  if (value >= 60) {
    return variantColor.orange
  }
  return variantColor.green
}

interface AnimatedProgressProps {
  className?: string
  value: number
  variant?: Variant
}

export function AnimatedProgress({
  value,
  variant = "auto",
  className,
}: AnimatedProgressProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [displayed, setDisplayed] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          setDisplayed(value)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [value])

  // Re-animate when value changes after first mount
  useEffect(() => {
    if (hasAnimated.current) {
      setDisplayed(value)
    }
  }, [value])

  const color = resolveColor(variant, value)

  return (
    <div className={cn("w-full", className)} ref={ref}>
      <Progress
        style={{ "--progress-color": color } as React.CSSProperties}
        value={displayed}
      />
    </div>
  )
}
