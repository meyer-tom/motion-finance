"use server"

import { revalidatePath } from "next/cache"
import { markChecklistStep } from "@/lib/actions/onboarding"
import { getAuthSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db"
import {
  type CreateAccountInput,
  createAccountSchema,
  type UpdateAccountInput,
  updateAccountSchema,
} from "@/lib/validations/accounts"

async function requireAuth() {
  const session = await getAuthSession()
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
    orderBy: { order: "asc" },
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

  const count = await prisma.financialAccount.count({
    where: { userId: user.id },
  })

  const account = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      startingBalance: parsed.data.startingBalance,
      color: parsed.data.color,
      icon: parsed.data.icon,
      order: count,
    },
  })

  if (parsed.data.type === "SAVINGS") {
    await markChecklistStep(user.id, "savings")
  } else if (parsed.data.type === "CHECKING") {
    await markChecklistStep(user.id, "account")
  }

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

export async function reorderAccounts(orderedIds: string[]) {
  const user = await requireAuth()

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.financialAccount.updateMany({
        where: { id, userId: user.id },
        data: { order: index },
      })
    )
  )

  revalidatePath("/accounts")
  revalidatePath("/dashboard")
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
