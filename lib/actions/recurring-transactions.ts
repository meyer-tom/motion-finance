"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  type RecurringInput,
  recurringSchema,
} from "@/lib/validations/recurring-transactions"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

export async function getRecurringTransactions() {
  const user = await requireAuth()

  const items = await prisma.recurringTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      account: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          type: true,
        },
      },
      toAccount: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          type: true,
        },
      },
    },
  })

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    amount: Number(item.amount),
    description: item.description,
    categoryId: item.categoryId,
    accountId: item.accountId,
    toAccountId: item.toAccountId,
    frequency: item.frequency,
    isActive: item.isActive,
    category: item.category,
    account: item.account,
    toAccount: item.toAccount,
  }))
}

export async function createRecurring(data: RecurringInput) {
  const user = await requireAuth()

  const parsed = recurringSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const item = await prisma.recurringTransaction.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId ?? null,
      accountId: parsed.data.accountId,
      toAccountId: parsed.data.toAccountId ?? null,
      frequency: parsed.data.frequency,
    },
    select: { id: true },
  })

  revalidatePath("/settings")
  return item
}

export async function updateRecurring(id: string, data: RecurringInput) {
  const user = await requireAuth()

  const existing = await prisma.recurringTransaction.findUnique({
    where: { id },
  })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Récurrente introuvable")
  }

  const parsed = recurringSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const item = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId ?? null,
      accountId: parsed.data.accountId,
      toAccountId: parsed.data.toAccountId ?? null,
      frequency: parsed.data.frequency,
    },
    select: { id: true },
  })

  revalidatePath("/settings")
  return item
}

export async function deleteRecurring(id: string) {
  const user = await requireAuth()

  const existing = await prisma.recurringTransaction.findUnique({
    where: { id },
  })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Récurrente introuvable")
  }

  await prisma.recurringTransaction.delete({ where: { id } })
  revalidatePath("/settings")
}

export async function toggleRecurring(id: string) {
  const user = await requireAuth()

  const existing = await prisma.recurringTransaction.findUnique({
    where: { id },
  })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Récurrente introuvable")
  }

  await prisma.recurringTransaction.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })

  revalidatePath("/settings")
}
