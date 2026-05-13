"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect, useState, useTransition } from "react"
import { type Resolver, useForm } from "react-hook-form"
import { z } from "zod"
import { FormStepGuide } from "@/components/app/form-step-guide"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GoalItem } from "@/lib/actions/goals"
import { createGoal, updateGoal } from "@/lib/actions/goals"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"

const goalFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  targetAmount: z
    .coerce.number()
    .positive("Le montant cible doit être positif")
    .max(10_000_000, "Montant maximum : 10 000 000"),
  currentAmount: z
    .coerce.number()
    .min(0, "Le montant actuel ne peut pas être négatif")
    .max(10_000_000, "Montant maximum : 10 000 000"),
})
type GoalFormValues = z.infer<typeof goalFormSchema>

const GOAL_GUIDE_STEPS = 5

interface GoalFormSheetProps {
  editGoal?: GoalItem | null
  onGoalCompleted?: () => void
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  open: boolean
  showGuide?: boolean
}

function getSubmitLabel(isPending: boolean, isEditing: boolean): string {
  if (isPending) {
    return isEditing ? "Modification…" : "Création…"
  }
  return isEditing ? "Modifier" : "Créer l'objectif"
}

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) {
    return ""
  }
  const d = new Date(date)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function GoalFormSheet({
  editGoal,
  onGoalCompleted,
  onOpenChange,
  onSuccess,
  open,
  showGuide,
}: GoalFormSheetProps) {
  const isMobile = useIsMobile()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [deadlineStr, setDeadlineStr] = useState("")
  const isEditing = Boolean(editGoal)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: standardSchemaResolver(goalFormSchema) as Resolver<GoalFormValues>,
    defaultValues: { name: "", targetAmount: undefined, currentAmount: 0 },
  })

  const watchedName = watch("name")
  const watchedTarget = watch("targetAmount")
  const watchedCurrent = watch("currentAmount")
  const currentAmountRegistration = register("currentAmount")

  const [guideStep, setGuideStep] = useState(showGuide && !isEditing ? 0 : -1)

  useEffect(() => {
    if (open) {
      setServerError(null)
      if (editGoal) {
        reset({
          name: editGoal.name,
          targetAmount: editGoal.targetAmount,
          currentAmount: editGoal.currentAmount,
        })
        setDeadlineStr(toDateInputValue(editGoal.deadline))
      } else {
        reset({ name: "", targetAmount: undefined, currentAmount: 0 })
        setDeadlineStr("")
      }
      setGuideStep(showGuide && !isEditing ? 0 : -1)
    }
  }, [open, editGoal, reset, showGuide, isEditing])

  function onSubmit(data: GoalFormValues) {
    setServerError(null)
    startTransition(async () => {
      try {
        const cappedCurrent = Math.min(
          data.currentAmount ?? 0,
          data.targetAmount
        )
        const payload = {
          ...data,
          currentAmount: cappedCurrent,
          deadline: deadlineStr ? new Date(deadlineStr) : undefined,
        }
        let wasCompleted = false
        if (isEditing && editGoal) {
          const result = await updateGoal(editGoal.id, payload)
          wasCompleted = result.wasCompleted
        } else {
          const result = await createGoal(payload)
          wasCompleted = result.wasCompleted
        }
        onSuccess()
        onOpenChange(false)
        if (wasCompleted) {
          onGoalCompleted?.()
        }
      } catch (e) {
        setServerError(
          e instanceof Error ? e.message : "Une erreur est survenue"
        )
      }
    })
  }

  const nameValid = !!watchedName?.trim()
  const targetValid =
    typeof watchedTarget === "number" &&
    !Number.isNaN(watchedTarget) &&
    watchedTarget > 0
  const currentValid =
    typeof watchedCurrent === "number" && !Number.isNaN(watchedCurrent)

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Nom */}
      <div
        className={cn(
          "space-y-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 0 && "opacity-40"
        )}
      >
        <Label htmlFor="name">
          Nom{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Input
          id="name"
          placeholder="Voyage, voiture, urgences…"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>
      {guideStep === 0 ? (
        <FormStepGuide
          checklistStep="goal"
          className="-mt-2"
          description="Donnez un nom inspirant à votre objectif (ex : Voyage, Voiture, Urgences…)."
          isFirst={true}
          isLast={false}
          isValid={nameValid}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(1)}
          onPrev={() => setGuideStep(0)}
          stepIndex={0}
          title="Nom de l'objectif"
          totalSteps={GOAL_GUIDE_STEPS}
          validationMessage="Saisissez un nom pour continuer"
        />
      ) : null}

      {/* Montant cible */}
      <div
        className={cn(
          "space-y-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 1 && "opacity-40"
        )}
      >
        <Label htmlFor="targetAmount">
          Montant cible{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <div className="relative">
          <Input
            className="pr-8"
            id="targetAmount"
            inputMode="decimal"
            min={0.01}
            placeholder="0"
            step="0.01"
            type="number"
            {...register("targetAmount")}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
        </div>
        {errors.targetAmount ? (
          <p className="text-destructive text-xs">
            {errors.targetAmount.message}
          </p>
        ) : null}
      </div>
      {guideStep === 1 ? (
        <FormStepGuide
          checklistStep="goal"
          className="-mt-2"
          description="Combien souhaitez-vous épargner au total pour cet objectif ?"
          isFirst={false}
          isLast={false}
          isValid={targetValid}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(2)}
          onPrev={() => setGuideStep(0)}
          stepIndex={1}
          title="Montant cible"
          totalSteps={GOAL_GUIDE_STEPS}
          validationMessage="Entrez un montant positif pour continuer"
        />
      ) : null}

      {/* Montant actuel */}
      <div
        className={cn(
          "space-y-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 2 && "opacity-40"
        )}
      >
        <Label htmlFor="currentAmount">Montant déjà épargné</Label>
        <div className="relative">
          <Input
            className="pr-8"
            id="currentAmount"
            inputMode="decimal"
            max={Number.isNaN(watchedTarget) ? undefined : watchedTarget}
            min={0}
            placeholder="0"
            step="0.01"
            type="number"
            {...currentAmountRegistration}
            onChange={(e) => {
              const target = watchedTarget
              if (target !== undefined && !Number.isNaN(target)) {
                const num = Number(e.target.value)
                if (!Number.isNaN(num) && num > target) {
                  e.target.value = String(target)
                }
              }
              currentAmountRegistration.onChange(e)
            }}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
        </div>
        {errors.currentAmount ? (
          <p className="text-destructive text-xs">
            {errors.currentAmount.message}
          </p>
        ) : null}
      </div>
      {guideStep === 2 ? (
        <FormStepGuide
          checklistStep="goal"
          className="-mt-2"
          description="Si vous avez déjà mis de côté une somme, entrez-la ici (sinon laissez à 0)."
          isFirst={false}
          isLast={false}
          isValid={currentValid}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(3)}
          onPrev={() => setGuideStep(1)}
          stepIndex={2}
          title="Montant déjà épargné"
          totalSteps={GOAL_GUIDE_STEPS}
        />
      ) : null}

      {/* Date limite */}
      <div
        className={cn(
          "space-y-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 3 && "opacity-40"
        )}
      >
        <Label htmlFor="deadline">Date limite</Label>
        <Input
          id="deadline"
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDeadlineStr(e.target.value)}
          type="date"
          value={deadlineStr}
        />
      </div>
      {guideStep === 3 ? (
        <FormStepGuide
          checklistStep="goal"
          className="-mt-2"
          description="Une échéance permet de calculer combien épargner chaque mois (optionnel)."
          isFirst={false}
          isLast={false}
          isValid={true}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(4)}
          onPrev={() => setGuideStep(2)}
          stepIndex={3}
          title="Date limite (optionnel)"
          totalSteps={GOAL_GUIDE_STEPS}
        />
      ) : null}

      {serverError ? (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-xs"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      {/* Guide dernière étape */}
      {guideStep === 4 ? (
        <FormStepGuide
          checklistStep="goal"
          description="Cliquez sur Créer l'objectif pour commencer à suivre votre progression."
          isFirst={false}
          isLast={true}
          isValid={true}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(4)}
          onPrev={() => setGuideStep(3)}
          stepIndex={4}
          title="Tout est prêt !"
          totalSteps={GOAL_GUIDE_STEPS}
        />
      ) : null}

      <div className="flex gap-2 pt-1">
        <Button
          className="flex-1"
          onClick={() => onOpenChange(false)}
          type="button"
          variant="outline"
        >
          Annuler
        </Button>
        <Button
          className={cn("flex-1 transition-all duration-200")}
          disabled={isPending}
          type="submit"
        >
          {getSubmitLabel(isPending, isEditing)}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <BottomSheet onOpenChange={onOpenChange} open={open}>
        <div className="space-y-4 px-4 pt-2 pb-6">
          <h2 className="font-semibold text-base">
            {isEditing ? "Modifier l'objectif" : "Nouvel objectif"}
          </h2>
          {formContent}
        </div>
      </BottomSheet>
    )
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'objectif" : "Nouvel objectif"}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
