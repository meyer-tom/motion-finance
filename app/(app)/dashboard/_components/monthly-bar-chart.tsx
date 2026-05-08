"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartData {
  expenses: number[]
  granularity: "day" | "month"
  income: number[]
  labels: string[]
}

interface Props {
  chart: ChartData
}

interface BarTooltipItem {
  color: string
  fill: string
  name: string
  value: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatYAxis(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return String(value)
}

function BarChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  label?: string
  payload?: BarTooltipItem[]
}) {
  if (!(active && payload?.length)) {
    return null
  }
  return (
    <div className="rounded-xl border bg-background px-3 py-2.5 shadow-lg">
      <p className="mb-2 font-semibold text-xs">{label}</p>
      {payload.map((item) => (
        <div className="flex items-center gap-2 text-xs" key={item.name}>
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.fill ?? item.color }}
          />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto pl-4 font-medium tabular-nums">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyBarChart({ chart }: Props) {
  const data = chart.labels.map((label, i) => ({
    label,
    Revenus: chart.income[i] ?? 0,
    Dépenses: chart.expenses[i] ?? 0,
  }))

  const isEmpty = data.every((d) => d.Revenus === 0 && d.Dépenses === 0)

  if (isEmpty) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
        Aucune donnée sur cette période
      </div>
    )
  }

  return (
    <ResponsiveContainer height={200} width="100%">
      <BarChart
        barCategoryGap="20%"
        barGap={2}
        data={data}
        margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          stroke="currentColor"
          strokeDasharray="3 3"
          strokeOpacity={0.1}
          vertical={false}
        />
        <XAxis
          axisLine={false}
          dataKey="label"
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
          tickFormatter={formatYAxis}
          tickLine={false}
        />
        <Tooltip
          content={<BarChartTooltip />}
          cursor={{ fill: "currentColor", opacity: 0.05 }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, opacity: 0.7 }}>{value}</span>
          )}
          iconSize={8}
          iconType="circle"
          wrapperStyle={{ paddingTop: 8 }}
        />
        <Bar
          dataKey="Revenus"
          fill="var(--color-income)"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          dataKey="Dépenses"
          fill="var(--color-expense)"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
