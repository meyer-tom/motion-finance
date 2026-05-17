import { TrendingUp } from "lucide-react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { formatAmount } from "@/lib/utils/format"
import { getAccountIcon } from "@/lib/utils/account-icons"
import { cn } from "@/lib/utils"

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
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.09] via-card to-card">
      {/* Accent line top */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-6">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary/80">
          Solde total
        </p>

        <AnimatedAmount
          className="text-gradient-balance font-black text-5xl leading-none tracking-tighter lg:text-6xl"
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

        {data.accounts.length > 0 && (
          <div className="mt-5 flex-1 space-y-0.5 border-t border-border/50 pt-4">
            {data.accounts.map((acc) => {
              const IconComp = getAccountIcon(acc.icon)
              return (
                <div
                  className="flex items-center gap-2.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-foreground/[0.04]"
                  key={acc.id}
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${acc.color}25` }}
                  >
                    <IconComp className="size-[15px]" style={{ color: acc.color }} />
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
