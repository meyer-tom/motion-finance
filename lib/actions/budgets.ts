"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { type BudgetInput, budgetSchema } from "@/lib/validations/budgets"

export type BudgetAlert = {
  title: string
  body: string
  type: "WARNING" | "DANGER"
}

type BudgetEntity = { type: string; id: string; threshold: number }

type ToCreateItem = {
  userId: string
  type: "WARNING" | "DANGER"
  title: string
  body: string
  relatedEntity: BudgetEntity
}

async function evaluateBudgets(userId: string): Promise<{
  toCreate: ToCreateItem[]
  toDelete: string[]
}> {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const budgets = await prisma.budget.findMany({
    where: { userId, month: monthStart },
    include: { category: { select: { name: true } } },
  })

  if (budgets.length === 0) return { toCreate: [], toDelete: [] }

  const categoryIds = budgets.map((b) => b.categoryId)

  const [spending, existingNotifications] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: monthStart, lt: monthEnd },
        categoryId: { in: categoryIds },
      },
      _sum: { amount: true },
    }),
    prisma.notification.findMany({
      where: {
        userId,
        createdAt: { gte: monthStart, lt: monthEnd },
        relatedEntity: { path: ["type"], equals: "budget" },
      },
      select: { id: true, relatedEntity: true },
    }),
    // Nettoyage mensuel automatique
    prisma.notification.deleteMany({
      where: {
        userId,
        relatedEntity: { path: ["type"], equals: "budget" },
        createdAt: { lt: monthStart },
      },
    }),
  ])

  const spendingMap = new Map(
    spending.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)])
  )

  const existingMap = new Map<string, string>()
  for (const n of existingNotifications) {
    if (n.relatedEntity) {
      const e = n.relatedEntity as BudgetEntity
      existingMap.set(`${e.id}:${e.threshold}`, n.id)
    }
  }

  const toCreate: ToCreateItem[] = []
  const toDelete: string[] = []

  for (const budget of budgets) {
    const budgetAmount = Number(budget.amount)
    if (budgetAmount <= 0) continue

    const spent = spendingMap.get(budget.categoryId) ?? 0
    const ratio = spent / budgetAmount

    for (const threshold of [80, 100] as const) {
      const key = `${budget.id}:${threshold}`
      const existingId = existingMap.get(key)
      const isActive = threshold === 100 ? ratio >= 1 : ratio >= 0.8

      if (isActive && !existingId) {
        const isOver = threshold === 100
        toCreate.push({
          userId,
          type: isOver ? "DANGER" : "WARNING",
          title: isOver
            ? `Budget dépassé — ${budget.category.name}`
            : `Budget à 80% — ${budget.category.name}`,
          body: isOver
            ? `Vous avez dépassé votre budget pour ${budget.category.name} ce mois-ci.`
            : `Vous avez atteint 80% de votre budget pour ${budget.category.name} ce mois-ci.`,
          relatedEntity: { type: "budget", id: budget.id, threshold },
        })
      } else if (!isActive && existingId) {
        toDelete.push(existingId)
      }
    }
  }

  return { toCreate, toDelete }
}

/**
 * Crée les nouvelles alertes budget ET supprime les obsolètes.
 * À appeler uniquement sur createTransaction.
 */
export async function checkBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
  const { toCreate, toDelete } = await evaluateBudgets(userId)

  await Promise.all([
    toCreate.length > 0
      ? prisma.notification.createMany({ data: toCreate })
      : Promise.resolve(),
    toDelete.length > 0
      ? prisma.notification.deleteMany({ where: { id: { in: toDelete } } })
      : Promise.resolve(),
  ])

  return toCreate.map((n) => ({ title: n.title, body: n.body, type: n.type }))
}


export interface BudgetWithSpending {
  amount: number
  category: { name: string; icon: string; color: string }
  categoryId: string
  id: string
  month: Date
  percentage: number
  spent: number
}

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

function normalizeMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export async function createBudget(data: BudgetInput) {
  const user = await requireAuth()

  const parsed = budgetSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const month = normalizeMonth(parsed.data.month)

  try {
    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: parsed.data.categoryId,
        amount: parsed.data.amount,
        month,
      },
      select: { id: true },
    })

    revalidatePath("/budgets")
    revalidatePath("/dashboard")

    return budget
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("Un budget pour cette catégorie existe déjà ce mois-ci")
    }
    throw e
  }
}

export async function updateBudget(id: string, data: BudgetInput) {
  const user = await requireAuth()

  const existing = await prisma.budget.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Budget introuvable")
  }

  const parsed = budgetSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const month = normalizeMonth(parsed.data.month)

  try {
    const budget = await prisma.budget.update({
      where: { id },
      data: {
        categoryId: parsed.data.categoryId,
        amount: parsed.data.amount,
        month,
      },
      select: { id: true },
    })

    revalidatePath("/budgets")
    revalidatePath("/dashboard")

    return budget
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("Un budget pour cette catégorie existe déjà ce mois-ci")
    }
    throw e
  }
}

export async function deleteBudget(id: string) {
  const user = await requireAuth()

  const existing = await prisma.budget.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Budget introuvable")
  }

  await prisma.budget.delete({ where: { id } })

  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}

export async function copyBudgetsFromMonth(
  fromMonth: Date,
  toMonth: Date
): Promise<number> {
  const user = await requireAuth()

  const from = normalizeMonth(fromMonth)
  const to = normalizeMonth(toMonth)

  const [sourceBudgets, existingBudgets] = await Promise.all([
    prisma.budget.findMany({
      where: { userId: user.id, month: from },
    }),
    prisma.budget.findMany({
      where: { userId: user.id, month: to },
      select: { categoryId: true },
    }),
  ])

  if (sourceBudgets.length === 0) {
    return 0
  }

  const existingCategoryIds = new Set(existingBudgets.map((b) => b.categoryId))
  const toCreate = sourceBudgets.filter(
    (b) => !existingCategoryIds.has(b.categoryId)
  )

  if (toCreate.length === 0) {
    return 0
  }

  await prisma.budget.createMany({
    data: toCreate.map((b) => ({
      userId: user.id,
      categoryId: b.categoryId,
      amount: b.amount,
      month: to,
    })),
    skipDuplicates: true,
  })

  revalidatePath("/budgets")
  revalidatePath("/dashboard")

  return toCreate.length
}

export async function getBudgetsWithSpending(
  month: Date
): Promise<BudgetWithSpending[]> {
  const user = await requireAuth()

  const startOfMonth = normalizeMonth(month)
  const endOfMonth = new Date(
    Date.UTC(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth() + 1, 1)
  )

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id, month: startOfMonth },
    include: {
      category: { select: { name: true, icon: true, color: true } },
    },
    orderBy: { category: { name: "asc" } },
  })

  if (budgets.length === 0) {
    return []
  }

  const budgetCategoryIds = budgets.map((b) => b.categoryId)

  const spending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: { gte: startOfMonth, lt: endOfMonth },
      categoryId: { in: budgetCategoryIds },
    },
    _sum: { amount: true },
  })

  const spendingMap = new Map(
    spending.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)])
  )

  return budgets.map((b) => {
    const amount = Number(b.amount)
    const spent = spendingMap.get(b.categoryId) ?? 0
    const percentage = amount > 0 ? Math.round((spent / amount) * 100) : 0

    return {
      id: b.id,
      categoryId: b.categoryId,
      category: b.category,
      amount,
      spent,
      percentage,
      month: b.month,
    }
  })
}
