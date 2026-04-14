"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  type CreateAccountInput,
  createAccountSchema,
  type UpdateAccountInput,
  updateAccountSchema,
} from "@/lib/validations/accounts"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

async function computeBalance(
  accountId: string,
  startingBalance: number
): Promise<number> {
  const [income, expense, transferOut, transferIn] = await Promise.all([
    prisma.transaction.aggregate({
      where: { accountId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { accountId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { accountId, type: "TRANSFER" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { toAccountId: accountId },
      _sum: { amount: true },
    }),
  ])

  return (
    startingBalance +
    Number(income._sum.amount ?? 0) -
    Number(expense._sum.amount ?? 0) -
    Number(transferOut._sum.amount ?? 0) +
    Number(transferIn._sum.amount ?? 0)
  )
}

export async function getAccounts() {
  const user = await requireAuth()

  const accounts = await prisma.financialAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  return Promise.all(
    accounts.map(async (account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      color: account.color,
      icon: account.icon,
      startingBalance: Number(account.startingBalance),
      balance: await computeBalance(
        account.id,
        Number(account.startingBalance)
      ),
    }))
  )
}

export async function createAccount(data: CreateAccountInput) {
  const user = await requireAuth()
  const parsed = createAccountSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const account = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      startingBalance: parsed.data.startingBalance,
      color: parsed.data.color,
      icon: parsed.data.icon,
    },
  })

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    color: account.color,
    icon: account.icon,
  }
}

export async function updateAccount(id: string, data: UpdateAccountInput) {
  const user = await requireAuth()
  const parsed = updateAccountSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const existing = await prisma.financialAccount.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Compte introuvable")
  }

  const account = await prisma.financialAccount.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      icon: parsed.data.icon,
    },
  })

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    color: account.color,
    icon: account.icon,
  }
}

export async function deleteAccount(id: string) {
  const user = await requireAuth()

  const existing = await prisma.financialAccount.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Compte introuvable")
  }

  await prisma.financialAccount.delete({ where: { id } })

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
}
