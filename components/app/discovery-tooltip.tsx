"use client"

import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { markTooltipSeen } from "@/lib/actions/onboarding"
import { cn } from "@/lib/utils"

interface TooltipStep {
  description: string
  onEnter?: () => void
  title: string
}

interface DiscoveryTooltipProps {
  actionLabel?: string
  align?: "center" | "end" | "start"
  checklistCompleted: string[]
  checklistDismissed: boolean
  checklistStep: string
  children: React.ReactNode
  description?: string
  initialStep?: number
  onAction?: () => void
  onComplete?: () => void
  side?: "bottom" | "left" | "right" | "top"
  steps?: TooltipStep[]
  title?: string
  tooltipsSeen: string[]
}

export function DiscoveryTooltip({
  actionLabel,
  align = "end",
  checklistCompleted,
  checklistDismissed,
  checklistStep,
  children,
  description,
  initialStep = 0,
  onAction,
  onComplete,
  side = "bottom",
  steps,
  title,
  tooltipsSeen,
}: DiscoveryTooltipProps) {
  const [open, setOpen] = useState(false)
  const [skipped, setSkipped] = useState(() =>
    tooltipsSeen.includes(checklistStep)
  )
  const [tooltipStep, setTooltipStep] = useState(initialStep)

  const isMultiStep = Boolean(steps?.length)
  const taskDone =
    checklistDismissed || checklistCompleted.includes(checklistStep) || skipped

  useEffect(() => {
    if (taskDone) {
      return
    }
    const timer = setTimeout(() => {
      setOpen(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [taskDone])

  function handleSkip() {
    setOpen(false)
    setSkipped(true)
    markTooltipSeen(checklistStep)
  }

  function handleComplete() {
    handleSkip()
    onComplete?.()
  }

  function handleAction() {
    setOpen(false)
    onAction?.()
  }

  function handleTooltipNext() {
    if (!steps) {
      return
    }
    if (tooltipStep === steps.length - 1) {
      handleComplete()
      return
    }
    const next = tooltipStep + 1
    steps[next].onEnter?.()
    setTooltipStep(next)
  }

  function handleTooltipPrev() {
    if (!steps || tooltipStep === 0) {
      return
    }
    const prev = tooltipStep - 1
    steps[prev].onEnter?.()
    setTooltipStep(prev)
  }

  if (taskDone) {
    return <>{children}</>
  }

  const currentTitle = isMultiStep && steps ? steps[tooltipStep].title : title
  const currentDescription =
    isMultiStep && steps ? steps[tooltipStep].description : description

  return (
    <>
      {open &&
        createPortal(
          // z-[51] : au-dessus du BottomNav (z-50) et du Header (z-40)
          <div
            aria-hidden
            className="fade-in-0 fixed inset-0 z-[51] animate-in bg-black/60 duration-300"
            onPointerDown={() => setOpen(false)}
          />,
          document.body
        )}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverAnchor asChild>
          <div className={cn(open && "relative z-[52] rounded-xl")}>
            {children}
          </div>
        </PopoverAnchor>
        <PopoverContent
          align={align}
          className="z-[53] w-80 space-y-3"
          side={side}
          sideOffset={8}
        >
          {isMultiStep && steps ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        i === tooltipStep ? "bg-primary" : "bg-primary/25"
                      )}
                      key={String(i)}
                    />
                  ))}
                  <span className="ml-1 text-muted-foreground text-xs">
                    {tooltipStep + 1} / {steps.length}
                  </span>
                </div>
                <Button
                  className="-mt-1 -mr-1 h-5 w-5 shrink-0"
                  onClick={handleSkip}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <p className="font-semibold text-sm">{currentTitle}</p>
                <p className="text-muted-foreground text-sm">
                  {currentDescription}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button
                  className="gap-1 text-xs"
                  disabled={tooltipStep === 0}
                  onClick={handleTooltipPrev}
                  size="sm"
                  variant="ghost"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Précédent
                </Button>
                <Button
                  className="gap-1 text-xs"
                  onClick={handleTooltipNext}
                  size="sm"
                  variant="outline"
                >
                  {tooltipStep === steps.length - 1 ? "Terminer" : "Suivant"}
                  {tooltipStep < steps.length - 1 ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : null}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{currentTitle}</p>
                <Button
                  className="-mt-1 -mr-1 h-5 w-5 shrink-0"
                  onClick={() => setOpen(false)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                {currentDescription}
              </p>
              <div className="flex gap-2">
                {onAction && actionLabel ? (
                  <Button className="flex-1" onClick={handleAction} size="sm">
                    {actionLabel}
                  </Button>
                ) : null}
                <Button
                  className={onAction && actionLabel ? "shrink-0" : "flex-1"}
                  onClick={handleSkip}
                  size="sm"
                  variant="outline"
                >
                  Passer
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
