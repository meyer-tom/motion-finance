"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useCurrency } from "@/lib/context/currency-context"
import { formatAmount } from "@/lib/utils/format"
import { getCategoryIcon } from "@/lib/utils/category-icons"

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
}: {
  active?: boolean
  currency: string
  payload?: TooltipItem[]
}) {
  if (!(active && payload?.length)) {
    return null
  }
  const entry = payload[0]?.payload
  if (!entry) {
    return null
  }
  const IconComp = getCategoryIcon(entry.categoryIcon)
  return (
    <div className="rounded-xl border bg-background px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1.5 font-medium text-sm">
        <IconComp className="size-3.5" style={{ color: entry.fill }} />
        <span>{entry.categoryName}</span>
      </div>
      <p className="mt-0.5 text-muted-foreground text-xs">
        {formatAmount(entry.total, currency)} · {entry.percentage.toFixed(1)}%
      </p>
    </div>
  )
}

export function CategoryDonutChart({ categoryBreakdown }: Props) {
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
    <div>
      <ResponsiveContainer height={200} width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data}
            dataKey="value"
            innerRadius="52%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell fill={entry.fill} key={entry.categoryName} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Légende manuelle avec vraies icônes Lucide */}
      <ul className="mt-2 space-y-1.5">
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
