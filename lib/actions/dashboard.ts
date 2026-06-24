"use server"

import { cache } from "react"
import { getAuthSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db"

// ─────────────────────────────────────────────────────────────
// Types publics
// ─────────────────────────────────────────────────────────────

export type DashboardPeriodKey = "week" | "month" | "quarter" | "year" | string // custom:YYYY-MM-DD:YYYY-MM-DD

export interface DashboardData {
  accounts: Array<{
    id: string
    name: string
    type: string
    balance: number
    color: string
    icon: string
  }>

  allBudgets: Array<{
    id: string
    categoryName: string
    categoryIcon: string
    categoryColor: string
    amount: number
    spent: number
    percentage: number
    status: "ok" | "warning" | "danger"
  }>
  budgetAlerts: Array<{
    id: string
    categoryName: string
    categoryIcon: string
    categoryColor: string
    amount: number
    spent: number
    percentage: number
    status: "warning" | "danger"
  }>
  budgetSummary: {
    total: number
    ok: number
    warning: number
    danger: number
  }

  categoryBreakdown: Array<{
    categoryId: string | null
    categoryName: string
    categoryIcon: string
    categoryColor: string
    total: number
    percentage: number
  }>

  chart: {
    labels: string[]
    income: number[]
    expenses: number[]
    granularity: "day" | "month"
  }
  checkingBalance: number
  expenses: number
  expensesTrend: number | null

  forecastedBalance: number
  upcomingRecurringExpenses: number

  goals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    percentage: number
    deadline: string | null
  }>

  income: number
  incomeTrend: number | null
  netDifference: number

  periodKey: string

  recentTransactions: Array<{
    id: string
    title: string
    amount: number
    date: string
    type: "INCOME" | "EXPENSE" | "TRANSFER"
    category: { name: string; icon: string; color: string } | null
    accountName: string
    accountColor: string
    accountIcon: string
  }>
  savingsBalance: number
  savingsRate: number
  totalBalance: number

  transfers: {
    total: number
    items: Array<{
      id: string
      title: string
      amount: number
      date: string
      fromAccountName: string
      toAccountName: string
    }>
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers internes
// ─────────────────────────────────────────────────────────────

interface PeriodRange {
  from: Date
  to: Date
}

async function requireAuth() {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

function parsePeriodKey(key: string): PeriodRange {
  const now = new Date()

  if (key === "week") {
    const day = now.getUTCDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + mondayOffset
      )
    )
    return {
      from: monday,
      to: new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000),
    }
  }

  if (key === "quarter") {
    const q = Math.floor(now.getUTCMonth() / 3)
    return {
      from: new Date(Date.UTC(now.getUTCFullYear(), q * 3, 1)),
      to: new Date(Date.UTC(now.getUTCFullYear(), q * 3 + 3, 1)),
    }
  }

  if (key === "year") {
    return {
      from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
      to: new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1)),
    }
  }

  if (key.startsWith("custom:")) {
    const parts = key.split(":")
    const fromStr = parts[1]
    const toStr = parts[2]
    return {
      from: new Date(`${fromStr}T00:00:00Z`),
      // include the end day fully
      to: new Date(
        new Date(`${toStr}T00:00:00Z`).getTime() + 24 * 60 * 60 * 1000
      ),
    }
  }

  // default: current month
  return {
    from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
  }
}

function getPreviousPeriod(period: PeriodRange, key: string): PeriodRange {
  const durationMs = period.to.getTime() - period.from.getTime()

  if (key === "month") {
    return {
      from: new Date(
        Date.UTC(period.from.getUTCFullYear(), period.from.getUTCMonth() - 1, 1)
      ),
      to: period.from,
    }
  }

  if (key === "quarter") {
    return {
      from: new Date(
        Date.UTC(period.from.getUTCFullYear(), period.from.getUTCMonth() - 3, 1)
      ),
      to: period.from,
    }
  }

  if (key === "year") {
    return {
      from: new Date(Date.UTC(period.from.getUTCFullYear() - 1, 0, 1)),
      to: period.from,
    }
  }

  // week or custom: shift back by same duration
  return {
    from: new Date(period.from.getTime() - durationMs),
    to: period.from,
  }
}

function addFrequency(date: Date, frequency: string): Date {
  const d = new Date(date)
  switch (frequency) {
    case "WEEKLY":
      d.setDate(d.getDate() + 7)
      break
    case "MONTHLY":
      d.setMonth(d.getMonth() + 1)
      break
    case "QUARTERLY":
      d.setMonth(d.getMonth() + 3)
      break
    case "YEARLY":
      d.setFullYear(d.getFullYear() + 1)
      break
    default:
      break
  }
  return d
}

const MONTHS_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
]
const DAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

interface ChartConfig {
  chartFrom: Date
  chartTo: Date
  granularity: "day" | "month"
  labelKeys: string[]
  labels: string[]
}

function getChartConfig(periodKey: string, period: PeriodRange): ChartConfig {
  if (periodKey === "week") {
    const keys: string[] = []
    const labels: string[] = []
    const d = new Date(period.from)
    for (let i = 0; i < 7; i++) {
      keys.push(d.toISOString().slice(0, 10))
      labels.push(`${DAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()}`)
      d.setUTCDate(d.getUTCDate() + 1)
    }
    return {
      chartFrom: period.from,
      chartTo: period.to,
      granularity: "day",
      labelKeys: keys,
      labels,
    }
  }

  if (periodKey === "month") {
    // Toujours 6 mois glissants pour donner le contexte
    const now = new Date()
    const chartTo = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    )
    const chartFrom = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
    )
    const keys: string[] = []
    const labels: string[] = []
    const d = new Date(chartFrom)
    while (d < chartTo) {
      keys.push(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      )
      labels.push(
        `${MONTHS_SHORT[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
      )
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
    return {
      chartFrom,
      chartTo,
      granularity: "month",
      labelKeys: keys,
      labels,
    }
  }

  if (periodKey === "quarter" || periodKey === "year") {
    const keys: string[] = []
    const labels: string[] = []
    const d = new Date(period.from)
    while (d < period.to) {
      keys.push(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      )
      labels.push(
        `${MONTHS_SHORT[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
      )
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
    return {
      chartFrom: period.from,
      chartTo: period.to,
      granularity: "month",
      labelKeys: keys,
      labels,
    }
  }

  // custom: granularity par jour si ≤ 31j, sinon par mois
  const durationDays =
    (period.to.getTime() - period.from.getTime()) / (1000 * 60 * 60 * 24)

  if (durationDays <= 31) {
    const keys: string[] = []
    const labels: string[] = []
    const d = new Date(period.from)
    while (d < period.to) {
      keys.push(d.toISOString().slice(0, 10))
      labels.push(`${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`)
      d.setUTCDate(d.getUTCDate() + 1)
    }
    return {
      chartFrom: period.from,
      chartTo: period.to,
      granularity: "day",
      labelKeys: keys,
      labels,
    }
  }

  const keys: string[] = []
  const labels: string[] = []
  const d = new Date(
    Date.UTC(period.from.getUTCFullYear(), period.from.getUTCMonth(), 1)
  )
  while (d < period.to) {
    keys.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    )
    labels.push(
      `${MONTHS_SHORT[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`
    )
    d.setUTCMonth(d.getUTCMonth() + 1)
  }
  return {
    chartFrom: period.from,
    chartTo: period.to,
    granularity: "month",
    labelKeys: keys,
    labels,
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers de calcul (extraits pour réduire la complexité cognitive)
// ─────────────────────────────────────────────────────────────

function aggregateChartData(
  txs: Array<{ type: string; amount: { toString(): string }; date: Date }>,
  config: ChartConfig
) {
  const incomeByKey = new Map<string, number>()
  const expensesByKey = new Map<string, number>()

  for (const tx of txs) {
    const key =
      config.granularity === "day"
        ? tx.date.toISOString().slice(0, 10)
        : `${tx.date.getUTCFullYear()}-${String(tx.date.getUTCMonth() + 1).padStart(2, "0")}`

    const amount = Number(tx.amount)
    if (tx.type === "INCOME") {
      incomeByKey.set(key, (incomeByKey.get(key) ?? 0) + amount)
    } else {
      expensesByKey.set(key, (expensesByKey.get(key) ?? 0) + amount)
    }
  }

  return {
    labels: config.labels,
    income: config.labelKeys.map((k) => incomeByKey.get(k) ?? 0),
    expenses: config.labelKeys.map((k) => expensesByKey.get(k) ?? 0),
    granularity: config.granularity,
  }
}

interface CategoryGroup {
  _sum: { amount: { toString(): string } | null }
  categoryId: string | null
}

interface CategoryLookup {
  color: string
  icon: string
  id: string
  name: string
}

function buildCategoryBreakdown(
  groups: CategoryGroup[],
  categories: CategoryLookup[]
) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const totalExpenses = groups.reduce(
    (s, g) => s + Number(g._sum.amount ?? 0),
    0
  )

  const breakdown = groups
    .map((g) => {
      const cat = g.categoryId ? categoryMap.get(g.categoryId) : null
      const total = Number(g._sum.amount ?? 0)
      return {
        categoryId: g.categoryId,
        categoryName: cat?.name ?? "Sans catégorie",
        categoryIcon: cat?.icon ?? "💰",
        categoryColor: cat?.color ?? "#94a3b8",
        total,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  const BUCKET_THRESHOLD = 5
  const main = breakdown.filter((c) => c.percentage >= BUCKET_THRESHOLD)
  const others = breakdown.filter((c) => c.percentage < BUCKET_THRESHOLD)

  if (others.length > 1) {
    const othersTotal = others.reduce((s, c) => s + c.total, 0)
    main.push({
      categoryId: null,
      categoryName: "Autres",
      categoryIcon: "⋯",
      categoryColor: "#94a3b8",
      total: othersTotal,
      percentage: totalExpenses > 0 ? (othersTotal / totalExpenses) * 100 : 0,
    })
  } else {
    main.push(...others)
  }

  return main
}

interface BudgetRow {
  amount: { toString(): string }
  category: { name: string; icon: string; color: string }
  categoryId: string
  id: string
}

function budgetStatus(percentage: number): "ok" | "warning" | "danger" {
  if (percentage >= 100) {
    return "danger"
  }
  if (percentage >= 80) {
    return "warning"
  }
  return "ok"
}

function buildBudgetAlerts(
  budgets: BudgetRow[],
  spendingMap: Map<string | null, number>
) {
  const evaluated = budgets.map((b) => {
    const spent = spendingMap.get(b.categoryId) ?? 0
    const amount = Number(b.amount)
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0
    return { b, spent, amount, percentage }
  })

  const allBudgets = evaluated
    .map(({ b, spent, amount, percentage }) => ({
      id: b.id,
      categoryName: b.category.name,
      categoryIcon: b.category.icon,
      categoryColor: b.category.color,
      amount,
      spent,
      percentage,
      status: budgetStatus(percentage),
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const alerts = allBudgets.filter(
    (b): b is typeof b & { status: "warning" | "danger" } => b.status !== "ok"
  )

  const summary = {
    total: budgets.length,
    ok: allBudgets.filter((b) => b.status === "ok").length,
    warning: allBudgets.filter((b) => b.status === "warning").length,
    danger: allBudgets.filter((b) => b.status === "danger").length,
  }

  return { alerts, summary, allBudgets }
}

interface RecurringRow {
  accountId: string
  amount: { toString(): string }
  categoryId: string | null
  createdAt: Date
  frequency: string
  type: string
}

interface LastTxRow {
  _max: { date: Date | null }
  accountId: string
  categoryId: string | null
  type: string
}

function computeForecastedBalance(
  recurrings: RecurringRow[],
  lastTxRows: LastTxRow[],
  totalBalance: number,
  now: Date,
  monthEnd: Date
): { forecastedBalance: number; upcomingExpenses: number } {
  const lastTxMap = new Map<string, Date>()
  for (const g of lastTxRows) {
    if (g._max.date) {
      lastTxMap.set(
        `${g.type}:${g.accountId}:${g.categoryId ?? "null"}`,
        g._max.date
      )
    }
  }

  let income = 0
  let expenses = 0

  for (const r of recurrings) {
    const key = `${r.type}:${r.accountId}:${r.categoryId ?? "null"}`
    const lastDate = lastTxMap.get(key) ?? r.createdAt
    let next = addFrequency(lastDate, r.frequency)

    while (next <= monthEnd) {
      if (next > now) {
        const amt = Number(r.amount)
        if (r.type === "INCOME") {
          income += amt
        } else {
          expenses += amt
        }
      }
      next = addFrequency(next, r.frequency)
    }
  }

  return { forecastedBalance: totalBalance + income - expenses, upcomingExpenses: expenses }
}

// ─────────────────────────────────────────────────────────────
// Action principale — React.cache garantit un seul appel DB
// par render même si plusieurs sections l'appellent
// ─────────────────────────────────────────────────────────────

export const getDashboardData = cache(
  async (periodKey: string): Promise<DashboardData> => {
    const user = await requireAuth()

    const period = parsePeriodKey(periodKey)
    const prevPeriod = getPreviousPeriod(period, periodKey)
    const chartConfig = getChartConfig(periodKey, period)

    const now = new Date()
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    )
    const monthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    )

    const [
      rawAccounts,
      incomeByAccount,
      expenseByAccount,
      transferOutByAccount,
      transferInByAccount,
      currentPeriodStats,
      prevPeriodStats,
      periodCategoryBreakdown,
      periodTransfers,
      recentTxRaw,
      chartTxs,
      currentMonthBudgets,
      currentMonthSpending,
      allCategories,
      activeRecurrings,
      lastTxByPattern,
      rawGoals,
    ] = await Promise.all([
      // 1. Comptes
      prisma.financialAccount.findMany({
        where: { userId: user.id },
        orderBy: { order: "asc" },
      }),

      // 2–5. Composantes de solde par compte (évite N×4 requêtes)
      prisma.transaction.groupBy({
        by: ["accountId"],
        where: { userId: user.id, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["accountId"],
        where: { userId: user.id, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["accountId"],
        where: { userId: user.id, type: "TRANSFER" },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["toAccountId"],
        where: {
          userId: user.id,
          type: "TRANSFER",
          toAccountId: { not: null },
        },
        _sum: { amount: true },
      }),

      // 6. Stats période courante (revenus + dépenses)
      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId: user.id,
          type: { in: ["INCOME", "EXPENSE"] },
          date: { gte: period.from, lt: period.to },
        },
        _sum: { amount: true },
      }),

      // 7. Stats période précédente (pour tendances)
      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId: user.id,
          type: { in: ["INCOME", "EXPENSE"] },
          date: { gte: prevPeriod.from, lt: prevPeriod.to },
        },
        _sum: { amount: true },
      }),

      // 8. Dépenses par catégorie sur la période (donut)
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: { gte: period.from, lt: period.to },
        },
        _sum: { amount: true },
      }),

      // 9. Virements de la période
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: "TRANSFER",
          date: { gte: period.from, lt: period.to },
        },
        include: {
          account: { select: { name: true } },
          toAccount: { select: { name: true } },
        },
        orderBy: [{ date: "desc" }, { id: "desc" }],
      }),

      // 10. 5 dernières transactions (toutes périodes)
      prisma.transaction.findMany({
        where: { userId: user.id },
        include: {
          category: { select: { name: true, icon: true, color: true } },
          account: { select: { name: true, color: true, icon: true } },
        },
        orderBy: [{ date: "desc" }, { id: "desc" }],
        take: 5,
      }),

      // 11. Transactions pour le graphique
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: { in: ["INCOME", "EXPENSE"] },
          date: { gte: chartConfig.chartFrom, lt: chartConfig.chartTo },
        },
        select: { type: true, amount: true, date: true },
      }),

      // 12. Budgets du mois courant (toujours mois courant, pas la période)
      prisma.budget.findMany({
        where: { userId: user.id, month: monthStart },
        include: {
          category: { select: { name: true, icon: true, color: true } },
        },
      }),

      // 13. Dépenses par catégorie ce mois (pour alertes budget)
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: { gte: monthStart, lt: monthEnd },
        },
        _sum: { amount: true },
      }),

      // 14. Toutes les catégories visibles (pour noms dans le donut)
      prisma.category.findMany({
        where: {
          OR: [{ userId: user.id }, { isSystem: true }],
          isHidden: false,
        },
        select: { id: true, name: true, icon: true, color: true },
      }),

      // 15. Récurrentes actives (pour solde prévisionnel)
      prisma.recurringTransaction.findMany({
        where: {
          userId: user.id,
          isActive: true,
          type: { in: ["INCOME", "EXPENSE"] },
        },
        select: {
          id: true,
          type: true,
          amount: true,
          frequency: true,
          accountId: true,
          categoryId: true,
          createdAt: true,
        },
      }),

      // 16. Dernière date de tx par pattern (pour calcul prévisionnel)
      prisma.transaction.groupBy({
        by: ["type", "accountId", "categoryId"],
        where: {
          userId: user.id,
          type: { in: ["INCOME", "EXPENSE"] },
        },
        _max: { date: true },
      }),

      // 17. Objectifs d'épargne actifs
      prisma.savingsGoal.findMany({
        where: { userId: user.id, isCompleted: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          targetAmount: true,
          currentAmount: true,
          deadline: true,
        },
      }),
    ])

    // ── Soldes des comptes ────────────────────────────────────
    const incomeMap = new Map(
      incomeByAccount.map((g) => [g.accountId, Number(g._sum.amount ?? 0)])
    )
    const expenseMap = new Map(
      expenseByAccount.map((g) => [g.accountId, Number(g._sum.amount ?? 0)])
    )
    const transferOutMap = new Map(
      transferOutByAccount.map((g) => [g.accountId, Number(g._sum.amount ?? 0)])
    )
    const transferInMap = new Map(
      transferInByAccount
        .filter((g) => g.toAccountId !== null)
        .map((g) => [g.toAccountId as string, Number(g._sum.amount ?? 0)])
    )

    const accountsWithBalance = rawAccounts.map((acc) => {
      const starting = Number(acc.startingBalance)
      const balance =
        starting +
        (incomeMap.get(acc.id) ?? 0) -
        (expenseMap.get(acc.id) ?? 0) -
        (transferOutMap.get(acc.id) ?? 0) +
        (transferInMap.get(acc.id) ?? 0)
      return {
        id: acc.id,
        name: acc.name,
        type: acc.type as string,
        balance,
        color: acc.color,
        icon: acc.icon,
      }
    })

    const totalBalance = accountsWithBalance.reduce((s, a) => s + a.balance, 0)
    const checkingBalance = accountsWithBalance
      .filter((a) => a.type === "CHECKING")
      .reduce((s, a) => s + a.balance, 0)
    const savingsBalance = accountsWithBalance
      .filter((a) => a.type === "SAVINGS")
      .reduce((s, a) => s + a.balance, 0)

    // ── Stats de la période ───────────────────────────────────
    const income = Number(
      currentPeriodStats.find((g) => g.type === "INCOME")?._sum.amount ?? 0
    )
    const expenses = Number(
      currentPeriodStats.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0
    )
    const netDifference = income - expenses
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

    // ── Tendances ─────────────────────────────────────────────
    const prevIncome = Number(
      prevPeriodStats.find((g) => g.type === "INCOME")?._sum.amount ?? 0
    )
    const prevExpenses = Number(
      prevPeriodStats.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0
    )
    const incomeTrend =
      prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : null
    const expensesTrend =
      prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : null

    // ── Virements ─────────────────────────────────────────────
    const transfersTotal = periodTransfers.reduce(
      (s, t) => s + Number(t.amount),
      0
    )
    const transferItems = periodTransfers.map((t) => ({
      id: t.id,
      title: t.title,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      fromAccountName: t.account.name,
      toAccountName: t.toAccount?.name ?? "—",
    }))

    // ── Données graphique ─────────────────────────────────────
    const chart = aggregateChartData(chartTxs, chartConfig)

    // ── Répartition catégories (donut) ────────────────────────
    const mainCategories = buildCategoryBreakdown(
      periodCategoryBreakdown,
      allCategories
    )

    // ── Transactions récentes ─────────────────────────────────
    const recentTransactions = recentTxRaw.map((t) => ({
      id: t.id,
      title: t.title,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      type: t.type as "INCOME" | "EXPENSE" | "TRANSFER",
      category: t.category,
      accountName: t.account.name,
      accountColor: t.account.color,
      accountIcon: t.account.icon,
    }))

    // ── Alertes budgets ───────────────────────────────────────
    const monthSpendingMap = new Map(
      currentMonthSpending.map((s) => [
        s.categoryId,
        Number(s._sum.amount ?? 0),
      ])
    )
    const {
      alerts: budgetAlerts,
      summary: budgetSummary,
      allBudgets,
    } = buildBudgetAlerts(currentMonthBudgets, monthSpendingMap)

    // ── Solde prévisionnel ────────────────────────────────────
    const { forecastedBalance, upcomingExpenses: upcomingRecurringExpenses } = computeForecastedBalance(
      activeRecurrings,
      lastTxByPattern,
      totalBalance,
      now,
      monthEnd
    )

    const goals = rawGoals.map((g) => {
      const target = Number(g.targetAmount)
      const current = Number(g.currentAmount)
      return {
        id: g.id,
        name: g.name,
        targetAmount: target,
        currentAmount: current,
        percentage:
          target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0,
        deadline: g.deadline?.toISOString() ?? null,
      }
    })

    return {
      totalBalance,
      checkingBalance,
      savingsBalance,
      accounts: accountsWithBalance,
      income,
      expenses,
      netDifference,
      savingsRate,
      incomeTrend,
      expensesTrend,
      forecastedBalance,
      upcomingRecurringExpenses,
      transfers: { total: transfersTotal, items: transferItems },
      chart,
      categoryBreakdown: mainCategories,
      recentTransactions,
      budgetAlerts,
      budgetSummary,
      allBudgets,
      goals,
      periodKey,
    }
  }
)
