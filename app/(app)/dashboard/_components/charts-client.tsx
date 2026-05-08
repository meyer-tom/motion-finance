"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardData } from "@/lib/actions/dashboard"

const MonthlyBarChart = dynamic(
  () =>
    import("./monthly-bar-chart").then((m) => ({ default: m.MonthlyBarChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full" />,
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

function getChartTitle(periodKey: string) {
  if (periodKey === "week") {
    return "Cette semaine"
  }
  if (periodKey === "quarter") {
    return "Ce trimestre"
  }
  if (periodKey === "year") {
    return "Cette année"
  }
  if (periodKey.startsWith("custom:")) {
    return "Période sélectionnée"
  }
  return "6 derniers mois"
}

interface Props {
  categoryBreakdown: DashboardData["categoryBreakdown"]
  chart: DashboardData["chart"]
  periodKey: string
}

export function ChartsClient({ periodKey, chart, categoryBreakdown }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="font-semibold text-sm">
            Revenus & dépenses — {getChartTitle(periodKey)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart chart={chart} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-semibold text-sm">
            Répartition des dépenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryDonutChart categoryBreakdown={categoryBreakdown} />
        </CardContent>
      </Card>
    </div>
  )
}
