import { TrendingUp } from "lucide-react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { Card, CardContent } from "@/components/ui/card"
import { getDashboardData } from "@/lib/actions/dashboard"
import { cn } from "@/lib/utils"
import { getAccountIcon } from "@/lib/utils/account-icons"

interface Props {
  periodKey: string
}

export async function BalanceSection({ periodKey }: Props) {
  const data = await getDashboardData(periodKey)

  const hasForecasted = data.forecastedBalance !== data.totalBalance
  const forecastDiff = data.forecastedBalance - data.totalBalance
  const forecastPositive = forecastDiff >= 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6 pb-5">
        <div className="space-y-4">
          {/* Solde total prominent */}
          <div className="text-center">
            <p className="mb-1 font-medium text-muted-foreground text-sm">
              Solde total
            </p>
            <AnimatedAmount
              className="font-bold text-4xl tracking-tight"
              currency="EUR"
              value={data.totalBalance}
              variant="neutral"
            />
          </div>

          {/* Comptes individuels */}
          {data.accounts.length > 0 && (
            <>
              <div className="border-t" />
              <ul className="space-y-3">
                {data.accounts.map((acc) => {
                  const IconComp = getAccountIcon(acc.icon)
                  return (
                    <li className="flex items-center gap-3" key={acc.id}>
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${acc.color}20` }}
                      >
                        <IconComp
                          className="size-4"
                          style={{ color: acc.color }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {acc.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {acc.type === "CHECKING" ? "Courant" : "Épargne"}
                        </p>
                      </div>
                      <AnimatedAmount
                        className="shrink-0 font-semibold text-sm tabular-nums"
                        currency="EUR"
                        value={acc.balance}
                        variant="neutral"
                      />
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* Solde prévisionnel */}
          {hasForecasted && (
            <div className="flex items-center justify-between rounded-xl border border-dashed px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <TrendingUp className="size-3.5" />
                <span>Prévisionnel fin de mois</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AnimatedAmount
                  className="font-semibold text-sm"
                  currency="EUR"
                  value={data.forecastedBalance}
                  variant="neutral"
                />
                <span
                  className={cn(
                    "font-medium text-xs",
                    forecastPositive
                      ? "text-[var(--color-income)]"
                      : "text-[var(--color-expense)]"
                  )}
                >
                  ({forecastPositive ? "+" : ""}
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(forecastDiff)}
                  )
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
