"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const getServerCurrency = cache(async (): Promise<string> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return "EUR"
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true },
  })
  return user?.currency ?? "EUR"
})

import {
  type DeleteAccountInput,
  deleteAccountSchema,
  type UpdateCurrencyInput,
  type UpdateProfileInput,
  updateCurrencySchema,
  updateProfileSchema,
} from "@/lib/validations/settings"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

export async function updateProfile(data: UpdateProfileInput) {
  const user = await requireAuth()

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { firstName, lastName, image } = parsed.data

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      ...(image !== undefined && { image }),
    },
  })

  revalidatePath("/settings")
}

export async function updateCurrency(data: UpdateCurrencyInput) {
  const user = await requireAuth()

  const parsed = updateCurrencySchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { currency: parsed.data.currency },
  })

  revalidatePath("/", "layout")
}

export async function resetOnboarding() {
  const user = await requireAuth()

  await prisma.onboardingProgress.upsert({
    where: { userId: user.id },
    update: {
      checklistCompleted: [],
      checklistDismissed: false,
      tooltipsSeen: [],
    },
    create: {
      userId: user.id,
      checklistCompleted: [],
      tooltipsSeen: [],
    },
  })

  redirect("/onboarding")
}

export async function deleteUserAccount(data: DeleteAccountInput) {
  const user = await requireAuth()

  const parsed = deleteAccountSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  // Supprimer l'utilisateur — cascade supprime sessions, comptes, transactions, etc.
  await prisma.user.delete({ where: { id: user.id } })

  redirect("/login?deleted=1")
}
