import type React from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
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
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border/60 px-5 py-3.5">
          <span className="section-title">Budgets</span>
        </div>
        <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
          <p className="text-muted-foreground text-sm">Aucun budget configuré</p>
          <Link
            className="text-primary text-sm underline-offset-4 hover:underline"
            href="/budgets"
          >
            Créer un budget
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="section-title">Budgets</span>
          <span className="text-[11px] text-muted-foreground">
            {budgetSummary.ok}/{budgetSummary.total}
          </span>
          {budgetSummary.danger > 0 && (
            <Badge className="h-4 px-1.5 text-[10px]" variant="destructive">
              {budgetSummary.danger}×
            </Badge>
          )}
        </div>
        <Link
          className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-primary"
          href="/budgets"
        >
          Gérer
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <ul className="space-y-4 overflow-y-auto px-5 py-4 [max-height:340px]">
        {allBudgets.map((budget) => {
          const IconComp = getCategoryIcon(budget.categoryIcon)
          return (
            <li className="space-y-2" key={budget.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 font-medium text-[13px]">
                  <IconComp
                    className="size-3.5 shrink-0"
                    style={{ color: budget.categoryColor }}
                  />
                  <span className="truncate">{budget.categoryName}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatAmount(budget.spent, currency)} / {formatAmount(budget.amount, currency)}
                  </span>
                  {budget.status !== "ok" && (
                    <span
                      className="rounded-full px-1.5 py-0.5 font-medium text-[10px]"
                      style={
                        {
                          backgroundColor: `color-mix(in oklch, ${STATUS_COLOR[budget.status]} 15%, transparent)`,
                          color: STATUS_COLOR[budget.status],
                        } as React.CSSProperties
                      }
                    >
                      {budget.percentage}%
                    </span>
                  )}
                </div>
              </div>
              <Progress
                className="h-1.5 rounded-full"
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
    </div>
  )
}
