"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { createBudget, updateBudget } from "@/lib/actions/budgets"
import type { BudgetWithSpending } from "@/lib/actions/budgets"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { getCategoryIcon } from "@/lib/utils/category-icons"
import { budgetSchema } from "@/lib/validations/budgets"

// Le mois est géré par le sélecteur parent, pas par l'utilisateur dans ce formulaire
const budgetFormSchema = budgetSchema.omit({ month: true })
type BudgetFormValues = z.infer<typeof budgetFormSchema>

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
}

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août",
  "Septembre", "Octobre", "Novembre", "Décembre",
]

export function BudgetFormSheet({
  categories,
  editBudget,
  month,
  onOpenChange,
  onSuccess,
  open,
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
    resolver: standardSchemaResolver(budgetFormSchema),
    defaultValues: {
      categoryId: "",
      amount: undefined,
    },
  })

  const selectedCategoryId = watch("categoryId")

  useEffect(() => {
    if (open) {
      setServerError(null)
      if (editBudget) {
        reset({ categoryId: editBudget.categoryId, amount: editBudget.amount })
      } else {
        reset({ categoryId: "", amount: undefined })
      }
    }
  }, [open, editBudget, reset])

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
        setServerError(e instanceof Error ? e.message : "Une erreur est survenue")
      }
    })
  }

  const monthLabel = `${MONTH_LABELS[month.getUTCMonth()]} ${month.getUTCFullYear()}`

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Mois (lecture seule — contrôlé par le sélecteur) */}
      <div className="space-y-1.5">
        <Label>Mois</Label>
        <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
          {monthLabel}
        </div>
      </div>

      {/* Catégorie */}
      <div className="space-y-1.5">
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
          <p className="text-destructive text-xs">{errors.categoryId.message}</p>
        ) : null}
      </div>

      {/* Montant */}
      <div className="space-y-1.5">
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
            {...register("amount", { valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
        </div>
        {errors.amount ? (
          <p className="text-destructive text-xs">{errors.amount.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p
          className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-xs"
          role="alert"
        >
          {serverError}
        </p>
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
        <Button className="flex-1" disabled={isPending} type="submit">
          {isPending
            ? isEditing
              ? "Modification…"
              : "Création…"
            : isEditing
              ? "Modifier"
              : "Créer le budget"}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <BottomSheet onOpenChange={onOpenChange} open={open}>
        <div className="space-y-4 px-4 pb-6 pt-2">
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
