"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardData } from "@/lib/actions/dashboard"

const MonthlyBarChart = dynamic(
  () =>
    import("./monthly-bar-chart").then((m) => ({ default: m.MonthlyBarChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[250px] w-full" />,
  }
)

const CategoryDonutChart = dynamic(
  () =>
    import("./category-donut-chart").then((m) => ({
      default: m.CategoryDonutChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton className="h-3 w-full" key={i} />
          ))}
        </div>
      </div>
    ),
  }
)

function getPeriodTitle(periodKey: string): string {
  if (periodKey === "week") return "Cette semaine"
  if (periodKey === "quarter") return "Ce trimestre"
  if (periodKey === "year") return "Cette année"
  if (periodKey.startsWith("custom:")) return "Période sélectionnée"
  return "6 derniers mois"
}

interface Props {
  categoryBreakdown: DashboardData["categoryBreakdown"]
  chart: DashboardData["chart"]
  periodKey: string
}

export function ChartsClient({ periodKey, chart, categoryBreakdown }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Histogramme */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <span className="section-title">Revenus & dépenses</span>
          <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] text-muted-foreground">
            {getPeriodTitle(periodKey)}
          </span>
        </div>
        <div className="px-5 pb-5 pt-4">
          <MonthlyBarChart chart={chart} />
        </div>
      </div>

      {/* Anneau */}
      <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border/60 px-5 py-3.5">
          <span className="section-title">Répartition dépenses</span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-5 pb-5 pt-4">
          <CategoryDonutChart categoryBreakdown={categoryBreakdown} />
        </div>
      </div>
    </div>
  )
}
