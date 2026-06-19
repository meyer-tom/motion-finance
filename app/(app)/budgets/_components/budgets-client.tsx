"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
} from "lucide-react"
import { useCallback, useState, useTransition } from "react"
import { DiscoveryTooltip } from "@/components/app/discovery-tooltip"
import { Button } from "@/components/ui/button"
import type { BudgetWithSpending } from "@/lib/actions/budgets"
import {
  copyBudgetsFromMonth,
  getBudgetsWithSpending,
} from "@/lib/actions/budgets"
import { BudgetCard } from "./budget-card"
import type { BudgetCategoryOption } from "./budget-form-sheet"
import { BudgetFormSheet } from "./budget-form-sheet"
import { BudgetListSkeleton } from "./budget-skeletons"

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

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function prevMonthOf(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))
}

function monthLabel(date: Date): string {
  return `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

interface BudgetsClientProps {
  categories: BudgetCategoryOption[]
  checklistCompleted: string[]
  checklistDismissed: boolean
  initialData?: BudgetWithSpending[]
  initialMonth: Date
  tooltipsSeen: string[]
}

export function BudgetsClient({
  categories,
  checklistCompleted,
  checklistDismissed,
  initialData,
  initialMonth,
  tooltipsSeen,
}: Readonly<BudgetsClientProps>) {
  const showGuide = !(
    checklistDismissed ||
    checklistCompleted.includes("budget") ||
    tooltipsSeen.includes("budget")
  )
  const queryClient = useQueryClient()
  const [month, setMonth] = useState<Date>(() => startOfMonth(initialMonth))
  const [formOpen, setFormOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<BudgetWithSpending | null>(null)

  const monthKey = month.toISOString()
  const prevMonth = prevMonthOf(month)
  const prevMonthKey = prevMonth.toISOString()

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets", monthKey],
    queryFn: () => getBudgetsWithSpending(month),
    initialData:
      monthKey === startOfMonth(initialMonth).toISOString()
        ? initialData
        : undefined,
  })

  const currentIsEmpty = !isLoading && (budgets?.length ?? 0) === 0

  const { data: prevBudgets } = useQuery({
    queryKey: ["budgets", prevMonthKey],
    queryFn: () => getBudgetsWithSpending(prevMonth),
    enabled: currentIsEmpty,
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["budgets", monthKey] })
  }, [queryClient, monthKey])

  function prevMonthNav() {
    setMonth(
      (m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() - 1, 1))
    )
  }

  function nextMonthNav() {
    setMonth(
      (m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1))
    )
  }

  function openCreate() {
    setEditBudget(null)
    setFormOpen(true)
  }

  function openEdit(budget: BudgetWithSpending) {
    setEditBudget(budget)
    setFormOpen(true)
  }

  const showReconduction = currentIsEmpty && (prevBudgets?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl tracking-tight">Budgets</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Gérez vos plafonds mensuels par catégorie
          </p>
        </div>
        <DiscoveryTooltip
          actionLabel="Créer un budget"
          checklistCompleted={checklistCompleted}
          checklistDismissed={checklistDismissed}
          checklistStep="budget"
          description="Cliquez ici, sélectionnez une catégorie de dépense et définissez le montant maximum pour ce mois."
          onAction={openCreate}
          title="Budgets mensuels"
          tooltipsSeen={tooltipsSeen}
        >
          <Button
            className="btn-gradient-primary h-11 shrink-0 gap-2 rounded-full px-5 font-semibold shadow-md"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nouveau budget</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </DiscoveryTooltip>
      </div>

      {/* Sélecteur de mois */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <Button
          aria-label="Mois précédent"
          className="size-10"
          onClick={prevMonthNav}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <span className="font-semibold text-base capitalize tabular-nums">
          {monthLabel(month)}
        </span>
        <Button
          aria-label="Mois suivant"
          className="size-10"
          onClick={nextMonthNav}
          size="icon"
          variant="ghost"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Contenu */}
      {isLoading && <BudgetListSkeleton />}

      {!isLoading && budgets && budgets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              budget={budget}
              key={budget.id}
              onDeleted={invalidate}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {!isLoading && (budgets?.length ?? 0) === 0 && (
        <div className="flex flex-col gap-3">
          {showReconduction && (
            <ReconductionBanner
              count={prevBudgets?.length ?? 0}
              fromMonth={prevMonth}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: ["budgets", prevMonthKey],
                })
                invalidate()
              }}
              toMonth={month}
            />
          )}
          <EmptyBudgets onAdd={openCreate} />
        </div>
      )}

      <BudgetFormSheet
        categories={categories}
        editBudget={editBudget}
        month={month}
        onOpenChange={setFormOpen}
        onSuccess={invalidate}
        open={formOpen}
        showGuide={showGuide}
      />
    </div>
  )
}

function ReconductionBanner({
  count,
  fromMonth,
  toMonth,
  onSuccess,
}: Readonly<{
  count: number
  fromMonth: Date
  toMonth: Date
  onSuccess: () => void
}>) {
  const [isPending, startTransition] = useTransition()

  function handleCopy() {
    startTransition(async () => {
      await copyBudgetsFromMonth(fromMonth, toMonth)
      onSuccess()
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-card px-5 py-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <CalendarCheck className="size-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-base">
            Reprendre les budgets de {monthLabel(fromMonth)}
          </p>
          <p className="truncate text-muted-foreground text-sm">
            {count} budget{count > 1 ? "s" : ""} disponible
            {count > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <Button
        className="shrink-0"
        disabled={isPending}
        onClick={handleCopy}
        variant="outline"
      >
        {isPending ? "Copie…" : "Reprendre"}
      </Button>
    </div>
  )
}

function EmptyBudgets({ onAdd }: Readonly<{ onAdd: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-border/50 border-dashed py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
        <Wallet className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-base text-foreground">
          Aucun budget ce mois-ci
        </p>
        <p className="text-muted-foreground text-sm">
          Définissez un plafond par catégorie pour suivre vos dépenses.
        </p>
      </div>
      <Button
        className="btn-gradient-primary h-11 gap-2 px-6 text-base hover:opacity-90"
        onClick={onAdd}
      >
        <Plus className="size-5" />
        Créer un budget
      </Button>
    </div>
  )
}
