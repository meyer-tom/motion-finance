import { ArrowRight } from "lucide-react"
import type { DashboardData } from "@/lib/actions/dashboard"
import { formatAmount } from "@/lib/utils/format"

interface Props {
  currency: string
  periodKey: string
  transfers: DashboardData["transfers"]
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso))
}

function getPeriodLabel(periodKey: string) {
  if (periodKey === "week") return "cette semaine"
  if (periodKey === "quarter") return "ce trimestre"
  if (periodKey === "year") return "cette année"
  if (periodKey.startsWith("custom:")) return "sur la période"
  return "ce mois"
}

export function TransfersSection({ currency, periodKey, transfers }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="section-title">Virements</span>
          <span className="text-[11px] text-muted-foreground">
            {getPeriodLabel(periodKey)}
          </span>
        </div>
        {transfers.total > 0 && (
          <span className="font-semibold text-[13px] tabular-nums text-[var(--color-transfer)]">
            {formatAmount(transfers.total, currency)}
          </span>
        )}
      </div>
      <div className="px-5 py-4">
        {transfers.total === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-sm">
            Aucun virement {getPeriodLabel(periodKey)}
          </p>
        ) : (
          <ul className="space-y-3 overflow-y-auto [max-height:164px]">
            {transfers.items.map((t) => (
              <li
                className="flex items-center justify-between gap-3"
                key={t.id}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                    {formatDate(t.date)}
                  </span>
                  <div className="flex min-w-0 items-center gap-1 text-sm">
                    <span className="truncate text-muted-foreground">
                      {t.fromAccountName}
                    </span>
                    <ArrowRight className="size-3 shrink-0 text-muted-foreground/40" />
                    <span className="truncate text-muted-foreground">
                      {t.toAccountName}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-medium text-[var(--color-transfer)] text-sm tabular-nums">
                  {formatAmount(t.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
