import { ArrowRight, Target } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getDashboardData } from "@/lib/actions/dashboard"

interface Props {
  periodKey: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDeadline(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export async function GoalsSection({ periodKey }: Props) {
  const data = await getDashboardData(periodKey)
  const { goals } = data

  if (goals.length === 0) {
    return (
      <Card className="min-h-[220px]">
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <Target className="size-8 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            Aucun objectif d'épargne
          </p>
          <Link
            className="text-primary text-sm underline-offset-4 hover:underline"
            href="/goals"
          >
            Créer un objectif
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex min-h-[220px] flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-semibold text-sm">
          Objectifs d'épargne
        </CardTitle>
        <Link
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
          href="/goals"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="space-y-4 overflow-y-auto px-6 pb-6 [max-height:260px]">
          {goals.map((goal) => (
            <li className="space-y-1.5" key={goal.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-sm">{goal.name}</p>
                <span className="shrink-0 font-medium text-sm tabular-nums">
                  {goal.percentage}%
                </span>
              </div>
              <Progress
                className="h-2"
                style={
                  {
                    "--progress-color":
                      goal.percentage >= 100
                        ? "var(--color-income)"
                        : "var(--color-accent)",
                  } as React.CSSProperties
                }
                value={goal.percentage}
              />
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span className="tabular-nums">
                  {formatCurrency(goal.currentAmount)}
                  <span className="mx-1 opacity-50">/</span>
                  {formatCurrency(goal.targetAmount)}
                </span>
                {goal.deadline && (
                  <span>→ {formatDeadline(goal.deadline)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
