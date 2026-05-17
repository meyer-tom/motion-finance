import type React from "react"
import { ArrowRight, Target } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { formatAmount } from "@/lib/utils/format"

interface Props {
  periodKey: string
}

function formatDeadline(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export async function GoalsSection({ periodKey }: Props) {
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])
  const { goals } = data

  if (goals.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border/60 px-5 py-3.5">
          <span className="section-title">Objectifs d'épargne</span>
        </div>
        <div className="flex flex-col items-center gap-2.5 px-5 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Target className="size-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Aucun objectif d'épargne</p>
          <Link
            className="text-primary text-sm underline-offset-4 hover:underline"
            href="/goals"
          >
            Créer un objectif
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <span className="section-title">Objectifs d'épargne</span>
        <Link
          className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-primary"
          href="/goals"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <ul className="space-y-4 overflow-y-auto px-5 py-4 [max-height:268px]">
        {goals.map((goal) => {
          const isComplete = goal.percentage >= 100
          return (
            <li className="space-y-2" key={goal.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-[13px]">{goal.name}</p>
                <span
                  className="shrink-0 rounded-full px-1.5 py-0.5 font-semibold text-[10px]"
                  style={
                    {
                      backgroundColor: isComplete
                        ? "color-mix(in oklch, var(--color-income) 15%, transparent)"
                        : "color-mix(in oklch, var(--primary) 12%, transparent)",
                      color: isComplete ? "var(--color-income)" : "var(--primary)",
                    } as React.CSSProperties
                  }
                >
                  {goal.percentage}%
                </span>
              </div>
              <Progress
                className="h-2"
                style={
                  {
                    "--progress-color": isComplete
                      ? "var(--color-income)"
                      : "var(--primary)",
                  } as React.CSSProperties
                }
                value={goal.percentage}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {formatAmount(goal.currentAmount, currency)}
                  <span className="mx-1 opacity-40">/</span>
                  {formatAmount(goal.targetAmount, currency)}
                </span>
                {goal.deadline && (
                  <span className="text-[11px] text-muted-foreground">
                    → {formatDeadline(goal.deadline)}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
