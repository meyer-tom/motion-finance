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
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full rounded-full transition-transform duration-700 ease-out"
        data-slot="progress-indicator"
        style={{
          transform: `translateX(-${100 - (value ?? 0)}%)`,
          background: "var(--progress-color, var(--color-primary))",
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
