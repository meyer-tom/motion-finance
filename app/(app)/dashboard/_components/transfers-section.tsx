import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/lib/actions/dashboard"

interface Props {
  periodKey: string
  transfers: DashboardData["transfers"]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso))
}

function getPeriodLabel(periodKey: string) {
  if (periodKey === "week") {
    return "cette semaine"
  }
  if (periodKey === "quarter") {
    return "ce trimestre"
  }
  if (periodKey === "year") {
    return "cette année"
  }
  if (periodKey.startsWith("custom:")) {
    return "sur la période"
  }
  return "ce mois"
}

export function TransfersSection({ periodKey, transfers }: Props) {
  return (
    <Card className="flex min-h-[220px] flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="font-semibold text-sm">Virements</CardTitle>
          <span className="text-muted-foreground text-xs">
            {getPeriodLabel(periodKey)}
          </span>
        </div>
        {transfers.total > 0 && (
          <span className="font-semibold text-sm tabular-nums">
            {formatCurrency(transfers.total)}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {transfers.total === 0 ? (
          <p className="px-6 py-2 text-center text-muted-foreground text-sm">
            Aucun virement
          </p>
        ) : (
          <ul className="space-y-2.5 overflow-y-auto px-6 pb-4 [max-height:160px]">
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
                  {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
