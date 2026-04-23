"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { type BudgetInput, budgetSchema } from "@/lib/validations/budgets"

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
