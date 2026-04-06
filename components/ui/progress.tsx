"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-2 w-full items-center overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full flex-1 rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${value ?? 0}%`,
          background: "var(--progress-color, var(--color-primary))",
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
