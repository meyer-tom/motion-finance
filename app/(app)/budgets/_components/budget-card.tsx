"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { deleteBudget } from "@/lib/actions/budgets"
import type { BudgetWithSpending } from "@/lib/actions/budgets"
import { getCategoryIcon } from "@/lib/utils/category-icons"
import { cn } from "@/lib/utils"

interface BudgetCardProps {
  budget: BudgetWithSpending
  onEdit: (budget: BudgetWithSpending) => void
  onDeleted: () => void
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
  if (percentage >= 100) return "destructive"
  if (percentage >= 80) return "outline"
  return "success"
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
        "rounded-xl border bg-card p-4 space-y-3 transition-opacity",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
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

        <div className="flex items-center gap-1 shrink-0">
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

      {/* Progress bar */}
      <AnimatedProgress value={capped} variant="auto" />

      {/* Amounts */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
