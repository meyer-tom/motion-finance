"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { SYSTEM_CATEGORIES } from "@/lib/data/system-categories"
import { prisma } from "@/lib/db"
import {
  type CompleteOnboardingInput,
  completeOnboardingSchema,
} from "@/lib/validations/onboarding"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

export async function markChecklistStep(userId: string, step: string) {
  try {
    const existing = await prisma.onboardingProgress.findUnique({
      where: { userId },
      select: { checklistCompleted: true },
    })
    if (existing?.checklistCompleted.includes(step)) {
      return
    }
    await prisma.onboardingProgress.upsert({
      where: { userId },
      update: { checklistCompleted: { push: step } },
      create: { userId, checklistCompleted: [step], tooltipsSeen: [] },
    })
  } catch {
    // fire-and-forget : ne bloque jamais l'action principale
  }
}

export async function getOnboardingProgress() {
  const user = await requireAuth()

  const [progress, hasChecking] = await Promise.all([
    prisma.onboardingProgress.findUnique({
      where: { userId: user.id },
      select: { checklistCompleted: true, checklistDismissed: true },
    }),
    prisma.financialAccount
      .count({ where: { userId: user.id, type: "CHECKING" } })
      .then((c) => c > 0),
  ])

  const base = progress?.checklistCompleted ?? []
  const checklistCompleted =
    hasChecking && !base.includes("account") ? [...base, "account"] : base

  return {
    checklistCompleted,
    checklistDismissed: progress?.checklistDismissed ?? false,
  }
}

export async function dismissChecklist() {
  const user = await requireAuth()
  await prisma.onboardingProgress.upsert({
    where: { userId: user.id },
    update: { checklistDismissed: true },
    create: {
      userId: user.id,
      checklistCompleted: [],
      checklistDismissed: true,
      tooltipsSeen: [],
    },
  })
  revalidatePath("/dashboard")
}

export async function getChecklistState(): Promise<{
  checklistCompleted: string[]
  checklistDismissed: boolean
  tooltipsSeen: string[]
}> {
  const user = await requireAuth()
  const progress = await prisma.onboardingProgress.findUnique({
    where: { userId: user.id },
    select: {
      checklistCompleted: true,
      checklistDismissed: true,
      tooltipsSeen: true,
    },
  })
  return {
    checklistCompleted: progress?.checklistCompleted ?? [],
    checklistDismissed: progress?.checklistDismissed ?? false,
    tooltipsSeen: progress?.tooltipsSeen ?? [],
  }
}

export async function markChecklistStepCurrent(step: string) {
  try {
    const user = await requireAuth()
    await markChecklistStep(user.id, step)
  } catch {
    // fire-and-forget
  }
}

export async function markTooltipSeen(step: string) {
  try {
    const user = await requireAuth()
    const existing = await prisma.onboardingProgress.findUnique({
      where: { userId: user.id },
      select: { tooltipsSeen: true },
    })
    if (existing?.tooltipsSeen.includes(step)) {
      return
    }
    await prisma.onboardingProgress.upsert({
      where: { userId: user.id },
      update: { tooltipsSeen: { push: step } },
      create: { userId: user.id, checklistCompleted: [], tooltipsSeen: [step] },
    })
  } catch {
    // fire-and-forget
  }
}

export async function completeOnboarding(data: CompleteOnboardingInput) {
  const user = await requireAuth()

  const parsed = completeOnboardingSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  // Garantit que les catégories système existent (seed non lancé en prod)
  const systemCount = await prisma.category.count({ where: { isSystem: true } })
  if (systemCount === 0) {
    await prisma.category.createMany({ data: SYSTEM_CATEGORIES })
  }

  await prisma.$transaction([
    prisma.financialAccount.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        type: "CHECKING",
        startingBalance: parsed.data.startingBalance,
        color: "#6d28d9",
        icon: "wallet",
        order: 0,
      },
    }),
    prisma.onboardingProgress.upsert({
      where: { userId: user.id },
      update: { checklistCompleted: ["account"] },
      create: {
        userId: user.id,
        checklistCompleted: ["account"],
        checklistDismissed: false,
        tooltipsSeen: [],
      },
    }),
  ])

  revalidatePath("/dashboard")
}
