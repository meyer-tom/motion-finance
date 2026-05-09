"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { markChecklistStep } from "@/lib/actions/onboarding"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  type CreateGoalInput,
  createGoalSchema,
  type UpdateGoalInput,
  updateGoalSchema,
} from "@/lib/validations/goals"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

async function markGoalCompleted(
  goalId: string,
  goalName: string,
  userId: string
) {
  await prisma.$transaction([
    prisma.savingsGoal.update({
      where: { id: goalId },
      data: { isCompleted: true, completedAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: "SUCCESS",
        title: `Objectif atteint — ${goalName}`,
        body: `Félicitations ! Vous avez atteint votre objectif d'épargne "${goalName}".`,
        relatedEntity: { type: "goal", id: goalId },
      },
    }),
  ])
}

export async function createGoal(data: CreateGoalInput) {
  const user = await requireAuth()

  const parsed = createGoalSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  // Plafonne currentAmount à targetAmount
  const cappedCurrent = Math.min(
    parsed.data.currentAmount,
    parsed.data.targetAmount
  )

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currentAmount: cappedCurrent,
      deadline: parsed.data.deadline,
      accountId: parsed.data.accountId,
    },
    select: { id: true },
  })

  const wasCompleted = cappedCurrent >= parsed.data.targetAmount
  if (wasCompleted) {
    await markGoalCompleted(goal.id, parsed.data.name, user.id)
  }

  await markChecklistStep(user.id, "goal")
  revalidatePath("/goals")
  revalidatePath("/dashboard")

  return { id: goal.id, wasCompleted }
}

export async function updateGoal(id: string, data: UpdateGoalInput) {
  const user = await requireAuth()

  const existing = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Objectif introuvable")
  }

  const parsed = updateGoalSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  // Plafonne currentAmount à targetAmount
  const cappedCurrent = Math.min(
    parsed.data.currentAmount,
    parsed.data.targetAmount
  )

  await prisma.savingsGoal.update({
    where: { id },
    data: {
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currentAmount: cappedCurrent,
      deadline: parsed.data.deadline ?? null,
      accountId: parsed.data.accountId ?? null,
    },
    select: { id: true },
  })

  const wasCompleted =
    !existing.isCompleted && cappedCurrent >= parsed.data.targetAmount
  if (wasCompleted) {
    await markGoalCompleted(id, parsed.data.name, user.id)
  }

  revalidatePath("/goals")
  revalidatePath("/dashboard")

  return { id, wasCompleted }
}

export async function deleteGoal(id: string) {
  const user = await requireAuth()

  const existing = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Objectif introuvable")
  }

  await prisma.savingsGoal.delete({ where: { id } })

  revalidatePath("/goals")
  revalidatePath("/dashboard")
}

export async function completeGoal(id: string) {
  const user = await requireAuth()

  const goal = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!goal || goal.userId !== user.id) {
    throw new Error("Objectif introuvable")
  }

  await markGoalCompleted(id, goal.name, user.id)

  revalidatePath("/goals")
  revalidatePath("/dashboard")
}

export interface GoalItem {
  accountId: string | null
  completedAt: Date | null
  createdAt: Date
  currentAmount: number
  deadline: Date | null
  id: string
  isCompleted: boolean
  name: string
  percentage: number
  targetAmount: number
}

export async function getGoals(): Promise<GoalItem[]> {
  const user = await requireAuth()

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return goals.map((g) => {
    const target = Number(g.targetAmount)
    const current = Number(g.currentAmount)
    const percentage =
      target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      deadline: g.deadline,
      accountId: g.accountId,
      isCompleted: g.isCompleted,
      completedAt: g.completedAt,
      percentage,
      createdAt: g.createdAt,
    }
  })
}

export async function updateGoalAmount(id: string, newAmount: number) {
  const user = await requireAuth()

  if (newAmount < 0) {
    throw new Error("Le montant ne peut pas être négatif")
  }

  const goal = await prisma.savingsGoal.findUnique({ where: { id } })
  if (!goal || goal.userId !== user.id) {
    throw new Error("Objectif introuvable")
  }

  const target = Number(goal.targetAmount)
  // Plafonne à la cible
  const capped = Math.min(newAmount, target)

  await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: capped },
  })

  if (!goal.isCompleted && capped >= target) {
    await markGoalCompleted(id, goal.name, user.id)
    revalidatePath("/goals")
    revalidatePath("/dashboard")
    return
  }

  revalidatePath("/goals")
  revalidatePath("/dashboard")
}
