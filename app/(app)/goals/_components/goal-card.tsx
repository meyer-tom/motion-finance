"use client"

import {
  CalendarClock,
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { useState, useTransition } from "react"
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
import { Input } from "@/components/ui/input"
import type { GoalItem } from "@/lib/actions/goals"
import { deleteGoal, updateGoalAmount } from "@/lib/actions/goals"
import { useCurrency } from "@/lib/context/currency-context"
import { formatAmount } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  goal: GoalItem
  onCompleted: (goalId: string) => void
  onDeleted: () => void
  onEdit: (goal: GoalItem) => void
  onUpdated: () => void
}

function formatAmountFlexible(value: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function getDeadlineInfo(
  deadline: Date | null,
  currentAmount: number,
  targetAmount: number,
  currency: string
): string | null {
  if (!deadline) {
    return null
  }

  const deadlineDate = new Date(deadline)
  const now = new Date()

  const endOfDay = new Date(deadlineDate)
  endOfDay.setHours(23, 59, 59, 999)
  if (endOfDay < now) {
    return "Échéance dépassée"
  }

  const remaining = targetAmount - currentAmount
  if (remaining <= 0) {
    return null
  }

  // Jours restants (basé sur les dates locales, sans heure)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const deadlineStart = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate()
  )
  const days = Math.round(
    (deadlineStart.getTime() - todayStart.getTime()) / 86_400_000
  )

  const dateStr = deadlineDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  })
  const remainingStr = formatAmount(remaining, currency)

  if (days === 0) {
    return `Aujourd'hui (${dateStr}) — ${remainingStr} restant`
  }
  if (days === 1) {
    return `Demain (${dateStr}) — ${remainingStr} restant`
  }
  if (days <= 13) {
    return `Dans ${days} jours (${dateStr}) — ${remainingStr} restant`
  }

  const months =
    (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
    (deadlineDate.getMonth() - now.getMonth())

  if (months <= 0) {
    return `Ce mois-ci (${dateStr}) — ${remainingStr} restant`
  }

  const perMonth = remaining / months
  return `${months} mois restant${months > 1 ? "s" : ""} (${dateStr}) — ${formatAmount(perMonth, currency)}/mois`
}

export function GoalCard({
  goal,
  onCompleted,
  onDeleted,
  onEdit,
  onUpdated,
}: GoalCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditingAmount, setIsEditingAmount] = useState(false)
  const [amountInput, setAmountInput] = useState("")
  const { currency } = useCurrency()

  const deadlineInfo = getDeadlineInfo(
    goal.deadline,
    goal.currentAmount,
    goal.targetAmount,
    currency
  )
  const progressVariant = goal.percentage >= 90 ? "accent" : "auto"

  function startEditing() {
    setAmountInput(String(goal.currentAmount))
    setIsEditingAmount(true)
  }

  function cancelEditing() {
    setIsEditingAmount(false)
  }

  function confirmUpdate() {
    const raw = Number.parseFloat(amountInput.replace(",", "."))
    if (Number.isNaN(raw) || raw < 0) {
      return
    }

    // Plafonne à la cible (le serveur fait de même)
    const newAmount = Math.min(raw, goal.targetAmount)
    const willComplete = !goal.isCompleted && newAmount >= goal.targetAmount

    startTransition(async () => {
      await updateGoalAmount(goal.id, newAmount)
      if (willComplete) {
        onCompleted(goal.id)
      }
      onUpdated()
      setIsEditingAmount(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteGoal(goal.id)
      onDeleted()
    })
  }

  return (
    <div
      className={cn(
        "group space-y-3 rounded-xl border bg-card p-4 transition-all",
        "hover:border-border/80 hover:bg-accent/5 hover:shadow-sm",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-semibold text-sm">{goal.name}</span>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={goal.percentage >= 100 ? "success" : "outline"}>
            {goal.percentage}%
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Options de l'objectif"
                className="size-7"
                size="icon"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
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

      {/* Progress */}
      <AnimatedProgress value={goal.percentage} variant={progressVariant} />

      {/* Amounts — montant actuel prominent + cible en muted */}
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "font-semibold text-base tabular-nums",
            goal.percentage >= 100
              ? "text-[var(--color-income)]"
              : "text-foreground"
          )}
        >
          {formatAmountFlexible(goal.currentAmount, currency)}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          sur {formatAmount(goal.targetAmount, currency)}
        </span>
      </div>

      {/* Deadline info avec icône */}
      {deadlineInfo ? (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <CalendarClock className="size-3.5 shrink-0" />
          <span>{deadlineInfo}</span>
        </div>
      ) : null}

      {/* Update amount — inline */}
      {isEditingAmount ? (
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Input
              autoFocus
              className="h-8 pr-7 text-sm"
              inputMode="decimal"
              max={goal.targetAmount}
              min={0}
              onChange={(e) => {
                const num = Number.parseFloat(e.target.value)
                if (!Number.isNaN(num) && num > goal.targetAmount) {
                  setAmountInput(String(goal.targetAmount))
                } else {
                  setAmountInput(e.target.value)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  confirmUpdate()
                }
                if (e.key === "Escape") {
                  cancelEditing()
                }
              }}
              step="0.01"
              type="number"
              value={amountInput}
            />
            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
              €
            </span>
          </div>
          <Button
            aria-label="Confirmer le montant"
            className="size-8 shrink-0"
            disabled={isPending}
            onClick={confirmUpdate}
            size="icon"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            aria-label="Annuler"
            className="size-8 shrink-0"
            onClick={cancelEditing}
            size="icon"
            variant="ghost"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          className="h-8 w-full text-xs"
          onClick={startEditing}
          size="sm"
          variant="outline"
        >
          Mettre à jour le montant
        </Button>
      )}
    </div>
  )
}
