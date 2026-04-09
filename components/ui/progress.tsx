"use client"

import { Progress as ProgressPrimitive } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative flex h-2 w-full items-center overflow-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full flex-1 rounded-full transition-all duration-500 ease-out"
        data-slot="progress-indicator"
        style={{
          width: `${value ?? 0}%`,
          background: "var(--progress-color, var(--color-primary))",
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
