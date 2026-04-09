"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const monthly = [
  { mois: "Nov", revenus: 3200, dépenses: 2100 },
  { mois: "Déc", revenus: 3800, dépenses: 2900 },
  { mois: "Jan", revenus: 3500, dépenses: 1800 },
  { mois: "Fév", revenus: 4200, dépenses: 2400 },
  { mois: "Mar", revenus: 3900, dépenses: 2200 },
  { mois: "Avr", revenus: 4500, dépenses: 2700 },
]

const solde = [
  { mois: "Nov", solde: 5200 },
  { mois: "Déc", solde: 6100 },
  { mois: "Jan", solde: 7800 },
  { mois: "Fév", solde: 9600 },
  { mois: "Mar", solde: 11_300 },
  { mois: "Avr", solde: 13_100 },
]

const categories = [
  { name: "Logement", value: 1100, fill: "oklch(0.541 0.281 293)" },
  { name: "Alimentation", value: 620, fill: "oklch(0.641 0.237 15)" },
  { name: "Transport", value: 280, fill: "oklch(0.685 0.168 237)" },
  { name: "Loisirs", value: 190, fill: "oklch(0.713 0.194 142)" },
  { name: "Abonnements", value: 160, fill: "oklch(0.78 0.16 65)" },
  { name: "Autres", value: 350, fill: "oklch(0.65 0.01 285)" },
]

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "13px",
  color: "var(--popover-foreground)",
}

export function BarChartDemo() {
  return (
    <ResponsiveContainer height={220} width="100%">
      <BarChart barGap={4} data={monthly}>
        <CartesianGrid
          stroke="var(--border)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          axisLine={false}
          dataKey="mois"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(v: number) => `${v / 1000}k`}
          tickLine={false}
          width={42}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} €`]}
        />
        <Bar
          dataKey="revenus"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="dépenses"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AreaChartDemo() {
  return (
    <ResponsiveContainer height={200} width="100%">
      <AreaChart data={solde}>
        <defs>
          <linearGradient id="gradSolde" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-accent)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--color-accent)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="var(--border)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          axisLine={false}
          dataKey="mois"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(v: number) => `${v / 1000}k`}
          tickLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} €`, "Solde"]}
        />
        <Area
          dataKey="solde"
          dot={false}
          fill="url(#gradSolde)"
          stroke="var(--color-accent)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function PieChartDemo() {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer height={180} width={180}>
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={categories}
            dataKey="value"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} €`]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <div className="flex items-center gap-2 text-sm" key={c.name}>
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: c.fill }}
            />
            <span className="flex-1 text-muted-foreground">{c.name}</span>
            <span className="font-medium tabular-nums">{c.value} €</span>
          </div>
        ))}
      </div>
    </div>
  )
}
