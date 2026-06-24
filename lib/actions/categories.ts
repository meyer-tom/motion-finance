"use server"

import { revalidatePath } from "next/cache"
import { markChecklistStep } from "@/lib/actions/onboarding"
import { getAuthSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db"
import {
  type CreateCategoryInput,
  createCategorySchema,
  type UpdateCategoryInput,
  type UpdateSystemCategoryAppearanceInput,
  updateCategorySchema,
  updateSystemCategoryAppearanceSchema,
} from "@/lib/validations/categories"

async function requireAuth() {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

export async function getCategoriesForUser(userId: string) {
  const [systemCategories, userCategories] = await Promise.all([
    prisma.category.findMany({
      where: { isSystem: true, isHidden: false },
    }),
    prisma.category.findMany({
      where: { userId },
    }),
  ])

  return [...systemCategories, ...userCategories].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "EXPENSE" ? -1 : 1
    }
    return a.name.localeCompare(b.name, "fr")
  })
}

export async function getSettingsCategories() {
  const user = await requireAuth()

  const [systemCategories, userCategories] = await Promise.all([
    prisma.category.findMany({
      where: { isSystem: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ])

  return { systemCategories, userCategories }
}

export async function toggleCategoryVisibility(id: string) {
  await requireAuth()

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category?.isSystem) {
    throw new Error("Catégorie introuvable")
  }

  await prisma.category.update({
    where: { id },
    data: { isHidden: !category.isHidden },
  })

  revalidatePath("/settings")
}

export async function createCategory(data: CreateCategoryInput) {
  const user = await requireAuth()
  const parsed = createCategorySchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const existing = await prisma.category.findFirst({
    where: { userId: user.id, type: parsed.data.type, name: parsed.data.name },
  })
  if (existing) {
    throw new Error("Une catégorie avec ce nom existe déjà pour ce type")
  }

  await prisma.category.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      icon: parsed.data.icon,
      isSystem: false,
      isHidden: false,
    },
  })

  await markChecklistStep(user.id, "categories")
  revalidatePath("/settings")
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const user = await requireAuth()
  const parsed = updateCategorySchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Catégorie introuvable")
  }

  const duplicate = await prisma.category.findFirst({
    where: {
      userId: user.id,
      type: parsed.data.type,
      name: parsed.data.name,
      NOT: { id },
    },
  })
  if (duplicate) {
    throw new Error("Une catégorie avec ce nom existe déjà pour ce type")
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      icon: parsed.data.icon,
    },
  })

  revalidatePath("/settings")
}

export async function updateSystemCategoryAppearance(
  id: string,
  data: UpdateSystemCategoryAppearanceInput
) {
  await requireAuth()

  const parsed = updateSystemCategoryAppearanceSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing?.isSystem) {
    throw new Error("Catégorie introuvable")
  }

  await prisma.category.update({
    where: { id },
    data: { color: parsed.data.color, icon: parsed.data.icon },
  })

  revalidatePath("/settings")
}

export async function deleteCategory(id: string) {
  const user = await requireAuth()

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    throw new Error("Catégorie introuvable")
  }

  const txCount = await prisma.transaction.count({ where: { categoryId: id } })

  await prisma.category.delete({ where: { id } })

  revalidatePath("/settings")

  return { deletedWithTransactions: txCount > 0, transactionCount: txCount }
}

export async function getTransactionCountForCategory(id: string) {
  await requireAuth()
  return prisma.transaction.count({ where: { categoryId: id } })
}
