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
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { AnimatedProgress } from "@/components/shared/animated-progress"
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

function getDeadlineInfo(
  deadline: Date | null,
  currentAmount: number,
  targetAmount: number,
  currency: string
): string | null {
  if (!deadline) return null

  const deadlineDate = new Date(deadline)
  const now = new Date()

  const endOfDay = new Date(deadlineDate)
  endOfDay.setHours(23, 59, 59, 999)
  if (endOfDay < now) return "Échéance dépassée"

  const remaining = targetAmount - currentAmount
  if (remaining <= 0) return null

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

  if (days === 0) return `Aujourd'hui (${dateStr}) — ${remainingStr} restant`
  if (days === 1) return `Demain (${dateStr}) — ${remainingStr} restant`
  if (days <= 13) return `Dans ${days} jours (${dateStr}) — ${remainingStr} restant`

  const months =
    (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
    (deadlineDate.getMonth() - now.getMonth())

  if (months <= 0) return `Ce mois-ci (${dateStr}) — ${remainingStr} restant`

  const perMonth = remaining / months
  return `${months} mois restant${months > 1 ? "s" : ""} (${dateStr}) — ${formatAmount(perMonth, currency)}/mois`
}

export function GoalCard({
  goal,
  onCompleted,
  onDeleted,
  onEdit,
  onUpdated,
}: Readonly<GoalCardProps>) {
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
  const isComplete = goal.percentage >= 100

  function startEditing() {
    setAmountInput(String(goal.currentAmount))
    setIsEditingAmount(true)
  }

  function cancelEditing() {
    setIsEditingAmount(false)
  }

  function confirmUpdate() {
    const raw = Number.parseFloat(amountInput.replace(",", "."))
    if (Number.isNaN(raw) || raw < 0) return

    const newAmount = Math.min(raw, goal.targetAmount)
    const willComplete = !goal.isCompleted && newAmount >= goal.targetAmount

    startTransition(async () => {
      await updateGoalAmount(goal.id, newAmount)
      if (willComplete) onCompleted(goal.id)
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
        "group/goal space-y-3 rounded-3xl border border-border bg-card p-4 transition-all duration-200",
        "hover:border-border-accent hover:bg-surface-elevated hover:shadow-md hover:shadow-black/8 dark:hover:shadow-black/25",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {/* Header : nom + dropdown */}
      <div className="flex items-start justify-between gap-2">
        <p className="truncate pt-0.5 font-semibold text-sm leading-tight">
          {goal.name}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "font-black font-mono tabular-nums text-lg leading-none",
              isComplete
                ? "text-(--color-income)"
                : "text-foreground"
            )}
          >
            {goal.percentage}%
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Options de l'objectif"
                className="size-9 touch-manipulation"
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

      {/* Barre de progression */}
      <AnimatedProgress progressClassName="h-2" value={goal.percentage} variant={progressVariant} />

      {/* Montant actuel */}
      <div>
        <AnimatedAmount
          className="font-black text-xl leading-none tracking-tight"
          currency={currency}
          value={goal.currentAmount}
          variant={isComplete ? "income" : "neutral"}
        />
        <p className="mt-0.5 text-xs text-muted-foreground">
          sur {formatAmount(goal.targetAmount, currency)}
        </p>
      </div>

      {/* Échéance */}
      {deadlineInfo ? (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <CalendarClock className="size-3.5 shrink-0" />
          <span>{deadlineInfo}</span>
        </div>
      ) : null}

      {/* Mise à jour du montant */}
      {isEditingAmount ? (
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Input
              autoFocus
              className="h-10 pr-7"
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
                if (e.key === "Enter") confirmUpdate()
                if (e.key === "Escape") cancelEditing()
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
            className="size-9 shrink-0 touch-manipulation"
            disabled={isPending}
            onClick={confirmUpdate}
            size="icon"
          >
            <Check className="size-4" />
          </Button>
          <Button
            aria-label="Annuler"
            className="size-9 shrink-0 touch-manipulation"
            onClick={cancelEditing}
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          className="h-10 w-full touch-manipulation"
          onClick={startEditing}
          variant="outline"
        >
          Mettre à jour le montant
        </Button>
      )}
    </div>
  )
}
