"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  type TransactionFilters,
  type TransactionInput,
  transactionFiltersSchema,
  transactionSchema,
} from "@/lib/validations/transaction"

const PAGE_SIZE = 20

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

function buildWhereClause(userId: string, filters: TransactionFilters) {
  return {
    userId,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.accountIds?.length
      ? {
          OR: [
            { accountId: { in: filters.accountIds } },
            { toAccountId: { in: filters.accountIds } },
          ],
        }
      : {}),
    ...(filters.categoryIds?.length
      ? { categoryId: { in: filters.categoryIds } }
      : {}),
    ...(filters.amountMin !== undefined || filters.amountMax !== undefined
      ? {
          amount: {
            ...(filters.amountMin === undefined
              ? {}
              : { gte: filters.amountMin }),
            ...(filters.amountMax === undefined
              ? {}
              : { lte: filters.amountMax }),
          },
        }
      : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          date: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo
              ? {
                  // +1 jour pour inclure toute la journée (lt exclusif)
                  lt: new Date(filters.dateTo.getTime() + 24 * 60 * 60 * 1000),
                }
              : {}),
          },
        }
      : {}),
    ...(filters.search
      ? {
          description: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(filters.tags?.length ? { tags: { hasSome: filters.tags } } : {}),
  }
}

/**
 * Vérifie les seuils budgétaires après création/modification d'une transaction EXPENSE.
 * Crée une notification si le seuil 80% ou 100% est franchi.
 * Déduplication : une seule notif par (userId, categoryId, mois, seuil).
 */
async function checkBudgetAlerts(userId: string, categoryId: string) {
  const now = new Date()
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  )

  const [budget, spentResult] = await Promise.all([
    prisma.budget.findUnique({
      where: {
        userId_categoryId_month: { userId, categoryId, month: monthStart },
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: "EXPENSE", // TRANSFER exclu — règle absolue
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
  ])

  if (!budget) {
    return
  }

  const budgetAmount = Number(budget.amount)
  const spent = Number(spentResult._sum.amount ?? 0)
  const ratio = spent / budgetAmount

  // Déterminer le seuil franchi (100% prioritaire sur 80%)
  let threshold: 80 | 100 | null = null
  if (ratio >= 1) {
    threshold = 100
  } else if (ratio >= 0.8) {
    threshold = 80
  }

  if (!threshold) {
    return
  }

  const notificationType = threshold === 100 ? "DANGER" : "WARNING"

  // Déduplication + fetch catégorie en parallèle
  const [existing, category] = await Promise.all([
    prisma.notification.findFirst({
      where: {
        userId,
        type: notificationType,
        relatedEntity: {
          path: ["categoryId"],
          equals: categoryId,
        },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    }),
  ])

  if (existing) {
    return
  }

  const categoryName = category?.name ?? "cette catégorie"

  await prisma.notification.create({
    data: {
      userId,
      type: notificationType,
      title:
        threshold === 100
          ? `Budget dépassé — ${categoryName}`
          : `Budget à 80% — ${categoryName}`,
      body:
        threshold === 100
          ? `Vous avez dépassé votre budget pour ${categoryName} ce mois-ci.`
          : `Vous avez atteint 80% de votre budget pour ${categoryName} ce mois-ci.`,
      relatedEntity: { type: "budget", id: budget.id, categoryId, threshold },
    },
  })
}

// ─────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────

export async function createTransaction(data: TransactionInput) {
  const user = await requireAuth()

  const parsed = transactionSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      amount: parsed.data.amount,
      date: parsed.data.date,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId ?? null,
      toAccountId: parsed.data.toAccountId ?? null,
      description: parsed.data.description,
      tags: parsed.data.tags,
    },
    select: { id: true },
  })

  if (parsed.data.type === "EXPENSE" && parsed.data.categoryId) {
    await checkBudgetAlerts(user.id, parsed.data.categoryId)
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")

  return tx
}

export async function updateTransaction(id: string, data: TransactionInput) {
  const user = await requireAuth()

  const existing = await prisma.transaction.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Transaction introuvable")
  }

  const parsed = transactionSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const tx = await prisma.transaction.update({
    where: { id },
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      amount: parsed.data.amount,
      date: parsed.data.date,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId ?? null,
      toAccountId: parsed.data.toAccountId ?? null,
      description: parsed.data.description,
      tags: parsed.data.tags,
    },
    select: { id: true },
  })

  if (parsed.data.type === "EXPENSE" && parsed.data.categoryId) {
    await checkBudgetAlerts(user.id, parsed.data.categoryId)
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")

  return tx
}

export async function deleteTransaction(id: string) {
  const user = await requireAuth()

  const existing = await prisma.transaction.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Transaction introuvable")
  }

  await prisma.transaction.delete({ where: { id } })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
}

export async function getUsedTags(): Promise<string[]> {
  const user = await requireAuth()

  const rows = await prisma.transaction.findMany({
    where: { userId: user.id, tags: { isEmpty: false } },
    select: { tags: true },
  })

  const set = new Set<string>()
  for (const row of rows) {
    for (const tag of row.tags) {
      set.add(tag)
    }
  }

  return [...set].sort((a, b) => a.localeCompare(b, "fr"))
}

export async function getTransactions(rawFilters: TransactionFilters = {}) {
  const user = await requireAuth()

  const parsed = transactionFiltersSchema.safeParse(rawFilters)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const filters = parsed.data
  const where = buildWhereClause(user.id, filters)

  const items = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1, // +1 pour savoir s'il y a une page suivante
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    skip: filters.cursor ? 1 : 0,
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      account: { select: { id: true, name: true, color: true, icon: true } },
      toAccount: { select: { id: true, name: true, color: true, icon: true } },
    },
  })

  const hasMore = items.length > PAGE_SIZE
  const page = hasMore ? items.slice(0, PAGE_SIZE) : items
  const nextCursor = hasMore ? (page.at(-1)?.id ?? null) : null

  return {
    items: page.map((tx) => ({
      id: tx.id,
      type: tx.type,
      title: tx.title,
      amount: Number(tx.amount),
      date: tx.date,
      description: tx.description,
      tags: tx.tags,
      category: tx.category,
      account: tx.account,
      toAccount: tx.toAccount,
    })),
    nextCursor,
    hasMore,
  }
}
