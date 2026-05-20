import { TrendingUp } from "lucide-react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/utils/format"
import { getAccountIcon } from "@/lib/utils/account-icons"

interface Props {
  periodKey: string
}

export async function BalanceSection({ periodKey }: Props) {
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])

  const hasForecasted = data.forecastedBalance !== data.totalBalance
  const forecastDiff = data.forecastedBalance - data.totalBalance
  const forecastPositive = forecastDiff >= 0

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex flex-col md:flex-row">
        {/* Solde total */}
        <div className="flex flex-col justify-center px-6 py-6 md:min-w-[240px] md:border-r md:border-border/50 md:py-7 lg:min-w-[280px]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Solde total
          </p>
          <AnimatedAmount
            className="font-black text-4xl leading-none tracking-tighter lg:text-5xl"
            currency={currency}
            value={data.totalBalance}
            variant="neutral"
          />
          {hasForecasted && (
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
              <TrendingUp className="size-3.5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">
                Fin de mois :{" "}
                <span className="font-semibold text-foreground">
                  {formatAmount(data.forecastedBalance, currency)}
                </span>
              </span>
              <span
                className={cn(
                  "font-semibold text-[11px]",
                  forecastPositive
                    ? "text-[var(--color-income)]"
                    : "text-[var(--color-expense)]"
                )}
              >
                ({forecastPositive ? "+" : ""}
                {formatAmount(forecastDiff, currency)})
              </span>
            </div>
          )}
        </div>

        {/* Comptes */}
        {data.accounts.length > 0 && (
          <div className="grid flex-1 auto-rows-fr divide-y divide-border/40 border-t border-border/50 md:grid-cols-2 md:divide-x md:divide-y-0 md:border-t-0 lg:grid-cols-3">
            {data.accounts.map((acc) => {
              const IconComp = getAccountIcon(acc.icon)
              return (
                <div
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
                  key={acc.id}
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${acc.color}20` }}
                  >
                    <IconComp className="size-4" style={{ color: acc.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium leading-tight">
                      {acc.name}
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      {acc.type === "CHECKING" ? "Courant" : "Épargne"}
                    </p>
                  </div>
                  <AnimatedAmount
                    className="shrink-0 text-[13px] font-semibold tabular-nums"
                    currency={currency}
                    value={acc.balance}
                    variant="neutral"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
