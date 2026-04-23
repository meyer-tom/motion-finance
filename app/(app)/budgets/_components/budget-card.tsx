"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
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
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"

interface BudgetCardProps {
  budget: BudgetWithSpending
  onDeleted: () => void
  onEdit: (budget: BudgetWithSpending) => void
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function percentageBadgeVariant(
  percentage: number
): "success" | "outline" | "destructive" {
  if (percentage >= 100) {
    return "destructive"
  }
  if (percentage >= 80) {
    return "outline"
  }
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

export function BudgetCard({ budget, onEdit, onDeleted }: BudgetCardProps) {
  const [isPending, startTransition] = useTransition()
  const CategoryIcon = getCategoryIcon(budget.category.icon)
  const capped = Math.min(budget.percentage, 100)

  function handleDelete() {
    startTransition(async () => {
      await deleteBudget(budget.id)
      onDeleted()
    })
  }

  return (
    <div
      className={cn(
        "group relative space-y-3 rounded-xl border bg-card p-4 transition-all",
        "hover:border-border/80 hover:bg-accent/5 hover:shadow-sm",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {/* Lien couvrant toute la card */}
      <Link
        aria-label={`Voir les transactions ${budget.category.name}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={buildTransactionsUrl(budget)}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        {/* Côté gauche — pointer-events-none : les clics traversent vers le Link */}
        <div className="pointer-events-none flex min-w-0 items-center gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${budget.category.color}20` }}
          >
            <CategoryIcon
              className="size-4"
              style={{ color: budget.category.color }}
            />
          </span>
          <span className="truncate font-medium text-sm">
            {budget.category.name}
          </span>
        </div>

        {/* Côté droit — pointer-events-auto + z-10 pour passer au-dessus du Link */}
        <div className="pointer-events-auto relative z-10 flex shrink-0 items-center gap-1">
          <Badge variant={percentageBadgeVariant(budget.percentage)}>
            {budget.percentage}%
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Options du budget"
                className="size-7"
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

      {/* Progress bar — pointer-events-none : clics traversent vers le Link */}
      <div className="pointer-events-none">
        <AnimatedProgress value={capped} variant="auto" />
      </div>

      {/* Amounts — pointer-events-none : clics traversent vers le Link */}
      <div className="pointer-events-none flex items-center justify-between text-muted-foreground text-xs">
        <span>
          Dépensé :{" "}
          <span
            className={cn(
              "font-medium",
              budget.percentage >= 100
                ? "text-[var(--color-expense)]"
                : "text-foreground"
            )}
          >
            {formatAmount(budget.spent)}
          </span>
        </span>
        <span>Plafond : {formatAmount(budget.amount)}</span>
      </div>
    </div>
  )
}
