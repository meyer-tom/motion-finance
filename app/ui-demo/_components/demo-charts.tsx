"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  { mois: "Mar", solde: 11300 },
  { mois: "Avr", solde: 13100 },
]

const categories = [
  { name: "Logement",      value: 1100, color: "oklch(0.541 0.281 293)" },
  { name: "Alimentation",  value:  620, color: "oklch(0.641 0.237 15)"  },
  { name: "Transport",     value:  280, color: "oklch(0.685 0.168 237)" },
  { name: "Loisirs",       value:  190, color: "oklch(0.713 0.194 142)" },
  { name: "Abonnements",   value:  160, color: "oklch(0.78 0.16 65)"    },
  { name: "Autres",        value:  350, color: "oklch(0.65 0.01 285)"   },
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
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={monthly} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="mois" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={42} tickFormatter={(v: number) => `${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} €`]} />
        <Bar dataKey="revenus"  fill="var(--color-income)"  radius={[4, 4, 0, 0]} />
        <Bar dataKey="dépenses" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AreaChartDemo() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={solde}>
        <defs>
          <linearGradient id="gradSolde" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--color-accent)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="mois" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={52} tickFormatter={(v: number) => `${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} €`, "Solde"]} />
        <Area type="monotone" dataKey="solde" stroke="var(--color-accent)" strokeWidth={2} fill="url(#gradSolde)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function PieChartDemo() {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={categories}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {categories.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} €`]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <div key={c.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
            <span className="flex-1 text-muted-foreground">{c.name}</span>
            <span className="tabular-nums font-medium">{c.value} €</span>
          </div>
        ))}
      </div>
    </div>
  )
}
