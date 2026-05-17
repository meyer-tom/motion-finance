import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
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
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium text-[11px]",
        positive
          ? "bg-[var(--color-income)]/10 text-[var(--color-income)]"
          : "bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
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
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])

  const netPositive = data.netDifference >= 0

  return (
    <>
      {/* Income card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-5 md:px-5">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full bg-[var(--color-income)]"
          />
          <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest md:text-[11px]">
            Revenus
          </span>
        </div>
        <AnimatedAmount
          className="font-black text-xl leading-none tracking-tight md:text-2xl lg:text-3xl"
          currency={currency}
          value={data.income}
          variant="income"
        />
        <TrendBadge trend={data.incomeTrend} />
      </div>

      {/* Expenses card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-5 md:px-5">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full bg-[var(--color-expense)]"
          />
          <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest md:text-[11px]">
            Dépenses
          </span>
        </div>
        <AnimatedAmount
          className="font-black text-xl leading-none tracking-tight md:text-2xl lg:text-3xl"
          currency={currency}
          value={data.expenses}
          variant="expense"
        />
        <TrendBadge trend={data.expensesTrend} />
      </div>

      {/* Net card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-5 md:px-5">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "inline-block size-2 rounded-full",
              netPositive
                ? "bg-[var(--color-income)]"
                : "bg-[var(--color-expense)]"
            )}
          />
          <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest md:text-[11px]">
            Net
          </span>
        </div>
        <AnimatedAmount
          className="font-black text-xl leading-none tracking-tight md:text-2xl lg:text-3xl"
          currency={currency}
          value={data.netDifference}
          variant={netPositive ? "income" : "expense"}
        />
        {data.income > 0 ? (
          <div className="flex items-center gap-1">
            <Minus className="size-3 text-muted-foreground" />
            <span
              className={cn(
                "font-semibold text-[11px]",
                data.savingsRate >= 0
                  ? "text-[var(--color-income)]"
                  : "text-[var(--color-expense)]"
              )}
            >
              {data.savingsRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-muted-foreground">épargne</span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        )}
      </div>
    </>
  )
}
