import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { Card, CardContent } from "@/components/ui/card"
import { getDashboardData } from "@/lib/actions/dashboard"
import { cn } from "@/lib/utils"

interface Props {
  periodKey: string
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) {
    return null
  }
  const positive = trend >= 0
  const absVal = Math.abs(trend)

  return (
    <span
      className={cn(
        "flex items-center gap-0.5 font-medium text-xs",
        positive ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"
      )}
    >
      {positive ? (
        <TrendingUp className="size-3" />
      ) : (
        <TrendingDown className="size-3" />
      )}
      {positive ? "+" : "-"}
      {absVal.toFixed(1)}%
    </span>
  )
}

export async function StatsSection({ periodKey }: Props) {
  const data = await getDashboardData(periodKey)

  const netPositive = data.netDifference >= 0

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {/* Revenus */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-muted-foreground text-xs">
                Revenus
              </p>
              <AnimatedAmount
                className="mt-1 font-semibold text-lg"
                currency="EUR"
                value={data.income}
                variant="income"
              />
              <TrendBadge trend={data.incomeTrend} />
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-income)]/12">
              <ArrowUpRight
                className="size-4 text-[var(--color-income)]"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dépenses */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-muted-foreground text-xs">
                Dépenses
              </p>
              <AnimatedAmount
                className="mt-1 font-semibold text-lg"
                currency="EUR"
                value={data.expenses}
                variant="expense"
              />
              <TrendBadge trend={data.expensesTrend} />
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-expense)]/12">
              <ArrowDownRight
                className="size-4 text-[var(--color-expense)]"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Différence nette + taux d'épargne */}
      <Card className="col-span-2 md:col-span-1">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-muted-foreground text-xs">
                Différence nette
              </p>
              <AnimatedAmount
                className="mt-1 font-semibold text-lg"
                currency="EUR"
                value={data.netDifference}
                variant={netPositive ? "income" : "expense"}
              />
              {data.income > 0 && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Minus className="size-3" />
                  Épargne&nbsp;
                  <span
                    className={cn(
                      "font-medium",
                      data.savingsRate >= 0
                        ? "text-[var(--color-income)]"
                        : "text-[var(--color-expense)]"
                    )}
                  >
                    {data.savingsRate.toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                netPositive
                  ? "bg-[var(--color-income)]/12"
                  : "bg-[var(--color-expense)]/12"
              )}
            >
              {netPositive ? (
                <TrendingUp
                  className="size-4 text-[var(--color-income)]"
                  strokeWidth={2.5}
                />
              ) : (
                <TrendingDown
                  className="size-4 text-[var(--color-expense)]"
                  strokeWidth={2.5}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
