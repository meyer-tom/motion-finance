"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkBudgetAlerts } from "@/lib/actions/budgets"
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

  const alerts =
    parsed.data.type === "EXPENSE" ? await checkBudgetAlerts(user.id) : []

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/budgets")

  return { id: tx.id, alerts }
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

  const alerts =
    parsed.data.type === "EXPENSE" || existing.type === "EXPENSE"
      ? await checkBudgetAlerts(user.id)
      : []

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/budgets")

  return { id: tx.id, alerts }
}

export async function deleteTransaction(id: string) {
  const user = await requireAuth()

  const existing = await prisma.transaction.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Transaction introuvable")
  }

  await prisma.transaction.delete({ where: { id } })

  if (existing.type === "EXPENSE") {
    await checkBudgetAlerts(user.id)
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/budgets")
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
