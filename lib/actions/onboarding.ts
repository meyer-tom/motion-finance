"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
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

export async function completeOnboarding(data: CompleteOnboardingInput) {
  const user = await requireAuth()

  const parsed = completeOnboardingSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
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
