"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Plus, Wallet } from "lucide-react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { getBudgetsWithSpending } from "@/lib/actions/budgets"
import type { BudgetWithSpending } from "@/lib/actions/budgets"
import type { BudgetCategoryOption } from "./budget-form-sheet"
import { BudgetCard } from "./budget-card"
import { BudgetFormSheet } from "./budget-form-sheet"
import { BudgetListSkeleton } from "./budget-skeletons"

const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril",
  "Mai", "Juin", "Juillet", "Août",
  "Septembre", "Octobre", "Novembre", "Décembre",
]

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

interface BudgetsClientProps {
  categories: BudgetCategoryOption[]
  initialData?: BudgetWithSpending[]
  initialMonth: Date
}

export function BudgetsClient({
  categories,
  initialData,
  initialMonth,
}: BudgetsClientProps) {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState<Date>(() => startOfMonth(initialMonth))
  const [formOpen, setFormOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<BudgetWithSpending | null>(null)

  const monthKey = month.toISOString()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets", monthKey],
    queryFn: () => getBudgetsWithSpending(month),
    initialData:
      monthKey === startOfMonth(initialMonth).toISOString()
        ? initialData
        : undefined,
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["budgets", monthKey] })
  }, [queryClient, monthKey])

  function prevMonth() {
    setMonth((m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() - 1, 1)))
  }

  function nextMonth() {
    setMonth((m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)))
  }

  function openCreate() {
    setEditBudget(null)
    setFormOpen(true)
  }

  function openEdit(budget: BudgetWithSpending) {
    setEditBudget(budget)
    setFormOpen(true)
  }

  const monthLabel = `${MONTH_LABELS[month.getUTCMonth()]} ${month.getUTCFullYear()}`

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-xl">Budgets</h1>
        <Button className="gap-1.5" onClick={openCreate} size="sm">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nouveau</span>
        </Button>
      </div>

      {/* Sélecteur de mois */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-2 py-1.5">
        <Button
          aria-label="Mois précédent"
          onClick={prevMonth}
          size="icon"
          variant="ghost"
          className="size-8"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-medium text-sm tabular-nums">{monthLabel}</span>
        <Button
          aria-label="Mois suivant"
          onClick={nextMonth}
          size="icon"
          variant="ghost"
          className="size-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <BudgetListSkeleton />
      ) : budgets && budgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              budget={budget}
              key={budget.id}
              onDeleted={invalidate}
              onEdit={openEdit}
            />
          ))}
        </div>
      ) : (
        <EmptyBudgets onAdd={openCreate} />
      )}

      <BudgetFormSheet
        categories={categories}
        editBudget={editBudget}
        month={month}
        onOpenChange={setFormOpen}
        onSuccess={invalidate}
        open={formOpen}
      />
    </div>
  )
}

function EmptyBudgets({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Wallet className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">Aucun budget ce mois-ci</p>
        <p className="text-muted-foreground text-xs">
          Définissez un plafond par catégorie pour suivre vos dépenses.
        </p>
      </div>
      <Button onClick={onAdd} size="sm" variant="outline">
        <Plus className="size-4" />
        Créer un budget
      </Button>
    </div>
  )
}
