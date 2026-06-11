"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  Trophy,
} from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { DiscoveryTooltip } from "@/components/app/discovery-tooltip"
import { GoalCompletionCelebration } from "@/components/shared/goal-completion-celebration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GoalItem } from "@/lib/actions/goals"
import { deleteGoal, getGoals } from "@/lib/actions/goals"
import { useCurrency } from "@/lib/context/currency-context"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/utils/format"
import { GoalCard } from "./goal-card"
import { GoalFormSheet } from "./goal-form-sheet"
import { GoalListSkeleton } from "./goal-skeletons"

interface GoalsClientProps {
  checklistCompleted: string[]
  checklistDismissed: boolean
  initialGoals: GoalItem[]
  tooltipsSeen: string[]
}

type TabValue = "active" | "completed"

export function GoalsClient({
  checklistCompleted,
  checklistDismissed,
  initialGoals,
  tooltipsSeen,
}: Readonly<GoalsClientProps>) {
  const showGuide = !(
    checklistDismissed ||
    checklistCompleted.includes("goal") ||
    tooltipsSeen.includes("goal")
  )
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabValue>("active")
  const [formOpen, setFormOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<GoalItem | null>(null)
  const [celebrationActive, setCelebrationActive] = useState(false)

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => getGoals(),
    initialData: initialGoals,
  })

  const active = goals.filter((g) => !g.isCompleted)
  const completed = goals.filter((g) => g.isCompleted)

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["goals"] })
  }

  function openCreate() {
    setEditGoal(null)
    setFormOpen(true)
  }

  function openEdit(goal: GoalItem) {
    setEditGoal(goal)
    setFormOpen(true)
  }

  function handleCompleted(_goalId: string) {
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
    setCelebrationActive(false)
    setTimeout(() => {
      setCelebrationActive(true)
      toast.success("Objectif atteint !", {
        description:
          "Félicitations ! Vous avez atteint votre objectif d'épargne.",
      })
    }, 50)
  }

  const tabIndex = activeTab === "active" ? 0 : 1

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-3xl tracking-tight">Objectifs</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Suivez vos objectifs d'épargne
          </p>
        </div>
        <DiscoveryTooltip
          actionLabel="Créer un objectif"
          checklistCompleted={checklistCompleted}
          checklistDismissed={checklistDismissed}
          checklistStep="goal"
          description="Cliquez ici, renseignez un nom, un montant cible et optionnellement une date limite pour suivre votre progression."
          onAction={openCreate}
          title="Objectifs d'épargne"
          tooltipsSeen={tooltipsSeen}
        >
          <Button
            className="btn-gradient-primary h-11 shrink-0 gap-2 rounded-full px-5 font-semibold shadow-md"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nouvel objectif</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </DiscoveryTooltip>
      </div>

      {isLoading ? (
        <GoalListSkeleton />
      ) : (
        <>
          {/* Tabs — sliding pill */}
          <div className="relative flex rounded-2xl border border-border bg-card p-1">
            <div
              aria-hidden
              className="pointer-events-none absolute top-1 bottom-1 rounded-xl bg-primary/15 transition-all duration-200"
              style={{
                width: "calc((100% - 8px) / 2)",
                left: `calc(4px + ${tabIndex} * (100% - 8px) / 2)`,
              }}
            />
            <TabButton
              active={activeTab === "active"}
              count={active.length}
              label="En cours"
              onClick={() => setActiveTab("active")}
            />
            <TabButton
              active={activeTab === "completed"}
              count={completed.length}
              label="Complétés"
              onClick={() => setActiveTab("completed")}
            />
          </div>

          {/* Contenu */}
          {activeTab === "active" &&
            (active.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((goal) => (
                  <GoalCard
                    goal={goal}
                    key={goal.id}
                    onCompleted={handleCompleted}
                    onDeleted={invalidate}
                    onEdit={openEdit}
                    onUpdated={invalidate}
                  />
                ))}
              </div>
            ) : (
              <EmptyActive onAdd={openCreate} />
            ))}

          {activeTab === "completed" &&
            (completed.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((goal) => (
                  <CompletedGoalCard
                    goal={goal}
                    key={goal.id}
                    onDeleted={invalidate}
                  />
                ))}
              </div>
            ) : (
              <EmptyCompleted onAdd={openCreate} />
            ))}
        </>
      )}

      <GoalFormSheet
        editGoal={editGoal}
        onGoalCompleted={() => handleCompleted("")}
        onOpenChange={setFormOpen}
        onSuccess={invalidate}
        open={formOpen}
        showGuide={showGuide}
      />

      <GoalCompletionCelebration isCompleted={celebrationActive} />
    </div>
  )
}

function TabButton({
  active,
  count,
  label,
  onClick,
}: Readonly<{
  active: boolean
  count: number
  label: string
  onClick: () => void
}>) {
  return (
    <button
      className={cn(
        "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-medium text-sm transition-colors duration-150",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] tabular-nums transition-colors duration-150",
            active
              ? "bg-primary/10 text-primary"
              : "bg-background/60 text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function CompletedGoalCard({
  goal,
  onDeleted,
}: Readonly<{
  goal: GoalItem
  onDeleted: () => void
}>) {
  const [isPending, startTransition] = useTransition()
  const { currency } = useCurrency()

  function handleDelete() {
    startTransition(async () => {
      await deleteGoal(goal.id)
      onDeleted()
    })
  }

  const completedDate = goal.completedAt
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(goal.completedAt))
    : null

  return (
    <div
      className={cn(
        "space-y-3 rounded-3xl border border-border bg-card p-4 transition-all duration-200",
        "hover:border-border-accent hover:bg-surface-elevated hover:shadow-md hover:shadow-black/8 dark:hover:shadow-black/25",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--color-income)/15">
            <Trophy className="size-4 text-(--color-income)" />
          </span>
          <span className="truncate font-semibold text-sm">{goal.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="success">Complété</Badge>
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

      {/* Montant + date */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          <CheckCircle2 className="size-4 text-(--color-income)" />
          {formatAmount(goal.targetAmount, currency)}
        </span>
        {completedDate ? (
          <span className="text-muted-foreground text-xs">{completedDate}</span>
        ) : null}
      </div>
    </div>
  )
}

function EmptyActive({ onAdd }: Readonly<{ onAdd: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-border/50 border-dashed py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
        <Target className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-foreground text-base">Aucun objectif en cours</p>
        <p className="text-muted-foreground text-sm">
          Définissez un objectif d'épargne pour suivre votre progression.
        </p>
      </div>
      <Button className="btn-gradient-primary h-11 gap-2 px-6 text-base hover:opacity-90" onClick={onAdd}>
        <Plus className="size-5" />
        Créer un objectif
      </Button>
    </div>
  )
}

function EmptyCompleted({ onAdd }: Readonly<{ onAdd: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-border/50 border-dashed py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
        <Trophy className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-foreground text-base">
          Aucun objectif atteint pour l'instant
        </p>
        <p className="text-muted-foreground text-sm">
          Vos objectifs complétés apparaîtront ici.
        </p>
      </div>
      <Button className="btn-gradient-primary h-11 gap-2 px-6 text-base hover:opacity-90" onClick={onAdd}>
        <Plus className="size-5" />
        Créer un objectif
      </Button>
    </div>
  )
}
