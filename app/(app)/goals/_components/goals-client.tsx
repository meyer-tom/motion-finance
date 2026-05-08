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
import { cn } from "@/lib/utils"
import { GoalCard } from "./goal-card"
import { GoalFormSheet } from "./goal-form-sheet"
import { GoalListSkeleton } from "./goal-skeletons"

interface GoalsClientProps {
  initialGoals: GoalItem[]
}

type TabValue = "active" | "completed"

export function GoalsClient({ initialGoals }: GoalsClientProps) {
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
    <div className="flex flex-col gap-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button className="gap-1.5" onClick={openCreate} size="sm">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nouveau</span>
        </Button>
      </div>

      {isLoading ? (
        <GoalListSkeleton />
      ) : (
        <>
          {/* Tabs — sliding pill */}
          <div className="relative flex rounded-xl bg-muted p-1">
            <div
              aria-hidden
              className="pointer-events-none absolute top-1 bottom-1 rounded-lg bg-background shadow-sm transition-all duration-200"
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
}: {
  active: boolean
  count: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium text-sm transition-colors duration-150",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground/70"
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
}: {
  goal: GoalItem
  onDeleted: () => void
}) {
  const [isPending, startTransition] = useTransition()

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
        "space-y-3 rounded-xl border bg-card p-4 transition-all",
        "hover:border-border/80 hover:bg-accent/5 hover:shadow-sm",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-income)]/15">
            <Trophy className="size-4 text-[var(--color-income)]" />
          </span>
          <span className="truncate font-medium text-sm">{goal.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant="success">Complété</Badge>
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
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <CheckCircle2 className="size-3.5 text-[var(--color-income)]" />
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(goal.targetAmount)}
        </span>
        {completedDate ? (
          <span className="text-muted-foreground">{completedDate}</span>
        ) : null}
      </div>
    </div>
  )
}

function EmptyActive({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Target className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">Aucun objectif en cours</p>
        <p className="text-muted-foreground text-xs">
          Définissez un objectif d'épargne pour suivre votre progression.
        </p>
      </div>
      <Button onClick={onAdd} size="sm" variant="outline">
        <Plus className="size-4" />
        Créer un objectif
      </Button>
    </div>
  )
}

function EmptyCompleted({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Trophy className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">
          Aucun objectif atteint pour l'instant
        </p>
        <p className="text-muted-foreground text-xs">
          Vos objectifs complétés apparaîtront ici.
        </p>
      </div>
      <Button onClick={onAdd} size="sm" variant="outline">
        <Plus className="size-4" />
        Créer un objectif
      </Button>
    </div>
  )
}
