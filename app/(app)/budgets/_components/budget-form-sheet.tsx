"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect, useState, useTransition } from "react"
import { type Resolver, useForm } from "react-hook-form"
import type { z } from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BudgetWithSpending } from "@/lib/actions/budgets"
import { createBudget, updateBudget } from "@/lib/actions/budgets"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"
import { budgetSchema } from "@/lib/validations/budgets"

// Le mois est géré par le sélecteur parent, pas par l'utilisateur dans ce formulaire
const budgetFormSchema = budgetSchema.omit({ month: true })
type BudgetFormValues = z.infer<typeof budgetFormSchema>

const BUDGET_GUIDE_STEPS = 3

export interface BudgetCategoryOption {
  color: string
  icon: string
  id: string
  name: string
}

interface BudgetFormSheetProps {
  categories: BudgetCategoryOption[]
  editBudget?: BudgetWithSpending | null
  month: Date
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  open: boolean
  showGuide?: boolean
}

function getBudgetSubmitLabel(isPending: boolean, isEditing: boolean): string {
  if (isPending) {
    return isEditing ? "Modification…" : "Création…"
  }
  return isEditing ? "Modifier" : "Créer le budget"
}

const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

export function BudgetFormSheet({
  categories,
  editBudget,
  month,
  onOpenChange,
  onSuccess,
  open,
  showGuide,
}: BudgetFormSheetProps) {
  const isMobile = useIsMobile()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = Boolean(editBudget)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: standardSchemaResolver(budgetFormSchema) as Resolver<BudgetFormValues>,
    defaultValues: {
      categoryId: "",
      amount: undefined,
    },
  })

  const selectedCategoryId = watch("categoryId")
  const watchedAmount = watch("amount")

  const [guideStep, setGuideStep] = useState(showGuide && !isEditing ? 0 : -1)

  useEffect(() => {
    if (open) {
      setServerError(null)
      if (editBudget) {
        reset({ categoryId: editBudget.categoryId, amount: editBudget.amount })
      } else {
        reset({ categoryId: "", amount: undefined })
      }
      setGuideStep(showGuide && !isEditing ? 0 : -1)
    }
  }, [open, editBudget, reset, showGuide, isEditing])

  function onSubmit(data: BudgetFormValues) {
    setServerError(null)
    startTransition(async () => {
      try {
        const payload = { ...data, month }
        if (isEditing && editBudget) {
          await updateBudget(editBudget.id, payload)
        } else {
          await createBudget(payload)
        }
        onSuccess()
        onOpenChange(false)
      } catch (e) {
        setServerError(
          e instanceof Error ? e.message : "Une erreur est survenue"
        )
      }
    })
  }

  const monthLabel = `${MONTH_LABELS[month.getUTCMonth()]} ${month.getUTCFullYear()}`
  const categoryValid = !!selectedCategoryId
  const amountValid =
    typeof watchedAmount === "number" &&
    !Number.isNaN(watchedAmount) &&
    watchedAmount > 0

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Mois (lecture seule — contrôlé par le sélecteur) */}
      <div
        className={cn(
          "space-y-1.5 transition-opacity duration-200",
          guideStep >= 0 && "opacity-40"
        )}
      >
        <Label>Mois</Label>
        <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-muted-foreground text-sm">
          {monthLabel}
        </div>
      </div>

      {/* Catégorie */}
      <div
        className={cn(
          "space-y-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 0 && "opacity-40"
        )}
      >
        <Label htmlFor="categoryId">
          Catégorie{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Select
          disabled={isEditing}
          onValueChange={(v) =>
            setValue("categoryId", v, { shouldValidate: true })
          }
          value={selectedCategoryId}
        >
          <SelectTrigger aria-label="Choisir une catégorie" id="categoryId">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon)
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: cat.color }}
                    />
                    {cat.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {errors.categoryId ? (
          <p className="text-destructive text-xs">
            {errors.categoryId.message}
          </p>
        ) : null}
      </div>
      {guideStep === 0 ? (
        <FormStepGuide
          checklistStep="budget"
          className="-mt-2"
          description="Choisissez la catégorie à encadrer (ex : Alimentation, Transport…)."
          isFirst={true}
          isLast={false}
          isValid={categoryValid}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(1)}
          onPrev={() => setGuideStep(0)}
          stepIndex={0}
          title="Catégorie"
          totalSteps={BUDGET_GUIDE_STEPS}
          validationMessage="Sélectionnez une catégorie pour continuer"
        />
      ) : null}

      {/* Montant */}
      <div
        className={cn(
          "space-y-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 1 && "opacity-40"
        )}
      >
        <Label htmlFor="amount">
          Plafond mensuel{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <div className="relative">
          <Input
            className="pr-8"
            id="amount"
            inputMode="decimal"
            min={0.01}
            placeholder="0"
            step="0.01"
            type="number"
            {...register("amount")}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
        </div>
        {errors.amount ? (
          <p className="text-destructive text-xs">{errors.amount.message}</p>
        ) : null}
      </div>
      {guideStep === 1 ? (
        <FormStepGuide
          checklistStep="budget"
          className="-mt-2"
          description="Définissez le montant maximum à ne pas dépasser ce mois-ci."
          isFirst={false}
          isLast={false}
          isValid={amountValid}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(2)}
          onPrev={() => setGuideStep(0)}
          stepIndex={1}
          title="Plafond mensuel"
          totalSteps={BUDGET_GUIDE_STEPS}
          validationMessage="Entrez un montant supérieur à 0 pour continuer"
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
      {guideStep === 2 ? (
        <FormStepGuide
          checklistStep="budget"
          description="Cliquez sur Créer le budget pour activer ce plafond mensuel."
          isFirst={false}
          isLast={true}
          isValid={true}
          onDismiss={() => setGuideStep(-1)}
          onNext={() => setGuideStep(2)}
          onPrev={() => setGuideStep(1)}
          stepIndex={2}
          title="Tout est prêt !"
          totalSteps={BUDGET_GUIDE_STEPS}
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
          {getBudgetSubmitLabel(isPending, isEditing)}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <BottomSheet onOpenChange={onOpenChange} open={open}>
        <div className="space-y-4 px-4 pt-2 pb-6">
          <h2 className="font-semibold text-base">
            {isEditing ? "Modifier le budget" : "Nouveau budget"}
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
            {isEditing ? "Modifier le budget" : "Nouveau budget"}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
