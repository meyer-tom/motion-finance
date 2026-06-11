"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { AnimatedProgress } from "@/components/shared/animated-progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BudgetWithSpending } from "@/lib/actions/budgets"
import { deleteBudget } from "@/lib/actions/budgets"
import { useCurrency } from "@/lib/context/currency-context"
import { formatAmount } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"

interface BudgetCardProps {
  budget: BudgetWithSpending
  onDeleted: () => void
  onEdit: (budget: BudgetWithSpending) => void
}

function percentageBadgeVariant(
  percentage: number
): "success" | "outline" | "destructive" {
  if (percentage >= 100) return "destructive"
  if (percentage >= 80) return "outline"
  return "success"
}

function buildTransactionsUrl(budget: BudgetWithSpending): string {
  const year = budget.month.getUTCFullYear()
  const month = budget.month.getUTCMonth()
  const mm = String(month + 1).padStart(2, "0")
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const dateFrom = `${year}-${mm}-01`
  const dateTo = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`
  const params = new URLSearchParams({
    type: "EXPENSE",
    categoryId: budget.categoryId,
    dateFrom,
    dateTo,
  })
  return `/transactions?${params.toString()}`
}

function cardColorClasses(percentage: number): string {
  if (percentage >= 100) {
    return "border-(--color-expense)/20 bg-(--color-expense)/5 hover:border-(--color-expense)/30"
  }
  if (percentage >= 80) {
    return "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/30"
  }
  return "border-border bg-card hover:border-border-accent hover:bg-surface-elevated"
}

export function BudgetCard({ budget, onEdit, onDeleted }: Readonly<BudgetCardProps>) {
  const [isPending, startTransition] = useTransition()
  const { currency } = useCurrency()
  const CategoryIcon = getCategoryIcon(budget.category.icon)
  const capped = Math.min(budget.percentage, 100)
  const remaining = budget.amount - budget.spent
  const overage = budget.spent - budget.amount
  const c = budget.category.color

  function handleDelete() {
    startTransition(async () => {
      await deleteBudget(budget.id)
      onDeleted()
    })
  }

  return (
    <div
      className={cn(
        "group/budget relative space-y-3 rounded-3xl border p-4 transition-all duration-200",
        "hover:shadow-md hover:shadow-black/8 dark:hover:shadow-black/25",
        cardColorClasses(budget.percentage),
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {/* Lien couvrant toute la card */}
      <Link
        aria-label={`Voir les transactions ${budget.category.name}`}
        className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={buildTransactionsUrl(budget)}
      />

      {/* Header : icône + nom + dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="pointer-events-none flex min-w-0 items-center gap-2.5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${c}22` }}
          >
            <CategoryIcon className="size-5" style={{ color: c }} />
          </div>
          <p className="truncate font-semibold text-sm leading-tight">
            {budget.category.name}
          </p>
        </div>

        {/* Bouton action — pointer-events-auto + z-10 pour passer au-dessus du Link */}
        <div className="pointer-events-auto relative z-10 flex shrink-0 items-center gap-1.5">
          <Badge variant={percentageBadgeVariant(budget.percentage)}>
            {budget.percentage}%
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Options du budget"
                className="size-9 touch-manipulation"
                size="icon"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Pencil className="size-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Montant dépensé */}
      <div className="pointer-events-none">
        <AnimatedAmount
          className="font-black text-xl leading-none tracking-tight"
          currency={currency}
          value={budget.spent}
          variant={budget.percentage >= 100 ? "expense" : "neutral"}
        />
        <p className="mt-0.5 text-xs text-muted-foreground">
          sur {formatAmount(budget.amount, currency)}
        </p>
      </div>

      {/* Barre de progression */}
      <div className="pointer-events-none">
        <AnimatedProgress progressClassName="h-2" value={capped} variant="auto" />
      </div>

      {/* Restant / Dépassement */}
      <div className="pointer-events-none">
        {budget.percentage >= 100 ? (
          <span className="font-medium text-xs text-(--color-expense)">
            Dépassement de {formatAmount(overage, currency)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Restant :{" "}
            <span
              className={cn(
                "font-semibold",
                budget.percentage >= 80 ? "text-orange-500" : "text-foreground"
              )}
            >
              {formatAmount(remaining, currency)}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
