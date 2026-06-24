import { AlertTriangle, CreditCard, TrendingDown, Wallet } from "lucide-react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { cn } from "@/lib/utils"

interface Props {
  periodKey: string
}

function computeMarginRatio(checkingBalance: number, margin: number): number {
  if (checkingBalance > 0) {
    return margin / checkingBalance
  }
  return margin >= 0 ? 1 : 0
}

function computeStatus(margin: number, marginRatio: number): "ok" | "warning" | "danger" {
  if (margin < 0) {
    return "danger"
  }
  if (marginRatio < 0.2) {
    return "warning"
  }
  return "ok"
}

function computeProgressPct(checkingBalance: number, upcomingRecurringExpenses: number): number {
  if (checkingBalance > 0) {
    return Math.min(100, Math.max(0, (upcomingRecurringExpenses / checkingBalance) * 100))
  }
  return upcomingRecurringExpenses > 0 ? 100 : 0
}

const STATUS_COLORS = {
  ok: "var(--color-income)",
  warning: "#f59e0b",
  danger: "var(--color-expense)",
} as const

export async function SpendingPowerSection({ periodKey }: Readonly<Props>) {
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])

  const { checkingBalance, upcomingRecurringExpenses } = data
  const margin = checkingBalance - upcomingRecurringExpenses

  // Pas de section si pas de comptes courants ni de récurrentes à venir
  if (checkingBalance === 0 && upcomingRecurringExpenses === 0) {
    return null
  }

  const marginRatio = computeMarginRatio(checkingBalance, margin)
  const status = computeStatus(margin, marginRatio)
  const statusColor = STATUS_COLORS[status]
  const progressPct = computeProgressPct(checkingBalance, upcomingRecurringExpenses)

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-border/60 border-b px-5 py-3.5">
        <Wallet className="size-4 text-muted-foreground" />
        <span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
          Vue rapide — comptes courants
        </span>
        {status !== "ok" && (
          <AlertTriangle
            className={cn(
              "ml-auto size-4",
              status === "danger" ? "text-(--color-expense)" : "text-amber-500"
            )}
          />
        )}
      </div>

      {/* Corps — 3 colonnes */}
      <div className="grid grid-cols-1 divide-y divide-border/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* Solde courant */}
        <div className="flex flex-col justify-center gap-1 px-5 py-4">
          <div className="mb-1 flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-muted-foreground" />
            <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
              Solde courant(s)
            </span>
          </div>
          <AnimatedAmount
            className="font-bold text-xl leading-none tracking-tight"
            currency={currency}
            value={checkingBalance}
            variant="neutral"
          />
          <p className="mt-0.5 text-[11px] text-muted-foreground">disponible maintenant</p>
        </div>

        {/* Charges à venir */}
        <div className="flex flex-col justify-center gap-1 px-5 py-4">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingDown className="size-3.5 text-muted-foreground" />
            <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
              Charges prévues
            </span>
          </div>
          {upcomingRecurringExpenses > 0 ? (
            <>
              <AnimatedAmount
                className="font-bold text-xl leading-none tracking-tight"
                currency={currency}
                value={upcomingRecurringExpenses}
                variant="expense"
              />
              <p className="mt-0.5 text-[11px] text-muted-foreground">récurrentes ce mois</p>
            </>
          ) : (
            <>
              <p className="font-bold text-xl leading-none tracking-tight text-muted-foreground">—</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">aucune récurrente à venir</p>
            </>
          )}
        </div>

        {/* Marge disponible */}
        <div className="flex flex-col justify-center gap-1 px-5 py-4">
          <div className="mb-1 flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
              Marge disponible
            </span>
          </div>
          <span style={{ color: statusColor }}>
            <AnimatedAmount
              className="font-bold text-xl leading-none tracking-tight"
              currency={currency}
              value={margin}
              variant="neutral"
            />
          </span>
          {upcomingRecurringExpenses > 0 && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {progressPct.toFixed(0)}% du solde engagé en charges
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
