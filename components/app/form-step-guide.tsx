"use client"

import { ChevronLeft, ChevronRight, TriangleAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { markTooltipSeen } from "@/lib/actions/onboarding"
import { cn } from "@/lib/utils"

interface FormStepGuideProps {
  checklistStep: string
  className?: string
  description: string
  isFirst: boolean
  isLast: boolean
  isValid: boolean
  onDismiss: () => void
  onNext: () => void
  onPrev: () => void
  stepIndex: number
  title: string
  totalSteps: number
  validationMessage?: string
}

export function FormStepGuide({
  checklistStep,
  className,
  description,
  isFirst,
  isLast,
  isValid,
  onDismiss,
  onNext,
  onPrev,
  stepIndex,
  title,
  totalSteps,
  validationMessage,
}: FormStepGuideProps) {
  function handleFinish() {
    onDismiss()
    markTooltipSeen(checklistStep)
  }

  function handleNext() {
    if (isLast) {
      handleFinish()
      return
    }
    onNext()
  }

  return (
    <div
      className={cn(
        "relative space-y-3 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-primary/[0.03] p-4 shadow-md",
        className
      )}
    >
      {/* Flèche pointant vers le champ actif */}
      {isLast ? null : (
        <div
          aria-hidden
          className="absolute -top-2 left-6 h-0 w-0 border-x-[8px] border-x-transparent border-b-[8px] border-b-primary/20"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              className={cn(
                "h-1.5 rounded-full bg-primary/25 transition-all duration-300",
                i === stepIndex && "w-4 bg-primary"
              )}
              key={String(i)}
              style={{ width: i === stepIndex ? undefined : "6px" }}
            />
          ))}
          <span className="ml-1 text-muted-foreground text-xs">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>
        <Button
          className="-mt-1 -mr-1 h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="mt-0.5 text-muted-foreground text-sm">{description}</p>
      </div>
      {!isValid && validationMessage ? (
        <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-amber-600 dark:text-amber-400">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">{validationMessage}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <Button
          className="h-7 gap-1 px-2 text-muted-foreground text-xs"
          disabled={isFirst}
          onClick={onPrev}
          size="sm"
          type="button"
          variant="ghost"
        >
          <ChevronLeft className="h-3 w-3" />
          Précédent
        </Button>
        <Button
          className="h-7 gap-1 px-3 text-xs"
          disabled={!isValid}
          onClick={handleNext}
          size="sm"
          type="button"
          variant={isValid ? "default" : "ghost"}
        >
          {isLast ? (
            "Terminer ✓"
          ) : (
            <>
              Suivant
              <ChevronRight className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
