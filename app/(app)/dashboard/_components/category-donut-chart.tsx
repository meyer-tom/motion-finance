"use client"

import { Pie, PieChart, Tooltip } from "recharts"
import { useCurrency } from "@/lib/context/currency-context"
import { getCategoryIcon } from "@/lib/utils/category-icons"
import { formatAmount } from "@/lib/utils/format"

interface CategoryItem {
  categoryColor: string
  categoryIcon: string
  categoryId: string | null
  categoryName: string
  percentage: number
  total: number
}

interface Props {
  categoryBreakdown: CategoryItem[]
}

type ChartEntry = CategoryItem & { name: string; value: number; fill: string }

interface TooltipItem {
  payload: ChartEntry
}

function CustomTooltip({
  active,
  currency,
  payload,
}: Readonly<{
  active?: boolean
  currency: string
  payload?: TooltipItem[]
}>) {
  if (!(active && payload?.length)) {
    return null
  }
  const entry = payload[0]?.payload
  if (!entry) {
    return null
  }
  const IconComp = getCategoryIcon(entry.categoryIcon)
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-black/30 shadow-xl">
      <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
        <IconComp className="size-3.5" style={{ color: entry.fill }} />
        <span>{entry.categoryName}</span>
      </div>
      <p className="mt-0.5 font-mono text-muted-foreground text-xs">
        {formatAmount(entry.total, currency)} · {entry.percentage.toFixed(1)}%
      </p>
    </div>
  )
}

export function CategoryDonutChart({ categoryBreakdown }: Readonly<Props>) {
  const { currency } = useCurrency()

  if (categoryBreakdown.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
        Aucune dépense sur cette période
      </div>
    )
  }

  const data: ChartEntry[] = categoryBreakdown.map((c) => ({
    ...c,
    name: c.categoryName,
    value: c.total,
    fill: c.categoryColor,
  }))

  return (
    <div className="flex items-center gap-5">
      {/* Anneau — dimensions fixes, pas de ResponsiveContainer */}
      <div className="shrink-0">
        <PieChart height={160} width={160}>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius="52%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
        </PieChart>
      </div>

      {/* Légende à droite */}
      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((entry) => {
          const IconComp = getCategoryIcon(entry.categoryIcon)
          return (
            <li
              className="flex items-center justify-between gap-2"
              key={entry.categoryName}
            >
              <div className="flex min-w-0 items-center gap-2">
                <IconComp
                  className="size-3.5 shrink-0"
                  style={{ color: entry.fill }}
                />
                <span className="truncate text-foreground/70 text-xs">
                  {entry.categoryName}
                </span>
              </div>
              <span className="shrink-0 font-medium text-xs tabular-nums">
                {formatAmount(entry.total, currency)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
