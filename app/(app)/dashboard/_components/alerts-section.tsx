import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { formatAmount } from "@/lib/utils/format"
import { getCategoryIcon } from "@/lib/utils/category-icons"

interface Props {
  periodKey: string
}

const STATUS_COLOR: Record<string, string> = {
  ok: "var(--color-income)",
  warning: "oklch(0.75 0.18 65)",
  danger: "var(--color-expense)",
}

export async function AlertsSection({ periodKey }: Props) {
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])
  const { allBudgets, budgetSummary } = data

  if (budgetSummary.total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            Aucun budget configuré
          </p>
          <Link
            className="text-primary text-sm underline-offset-4 hover:underline"
            href="/budgets"
          >
            Créer un budget
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="font-semibold text-sm">Budgets</CardTitle>
          <span className="text-muted-foreground text-xs">
            {budgetSummary.ok}/{budgetSummary.total} sous contrôle
          </span>
          {budgetSummary.danger > 0 && (
            <Badge className="h-5 px-1.5 text-xs" variant="destructive">
              {budgetSummary.danger} dépassé
              {budgetSummary.danger > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <Link
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
          href="/budgets"
        >
          Gérer
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ul className="space-y-3 overflow-y-auto px-6 pb-6 [max-height:264px]">
          {allBudgets.map((budget) => {
            const IconComp = getCategoryIcon(budget.categoryIcon)
            return (
              <li className="space-y-1.5" key={budget.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 font-medium text-sm">
                    <IconComp
                      className="size-3.5 shrink-0"
                      style={{ color: budget.categoryColor }}
                    />
                    <span className="truncate">{budget.categoryName}</span>
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {formatAmount(budget.spent, currency)} /{" "}
                      {formatAmount(budget.amount, currency)}
                    </span>
                    {budget.status !== "ok" && (
                      <Badge
                        className="h-5 px-1.5 text-xs"
                        variant={
                          budget.status === "danger"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {budget.percentage}%
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress
                  className="h-1.5"
                  style={
                    {
                      "--progress-color": STATUS_COLOR[budget.status],
                    } as React.CSSProperties
                  }
                  value={Math.min(budget.percentage, 100)}
                />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
