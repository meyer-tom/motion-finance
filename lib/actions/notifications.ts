"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

export async function getNotifications() {
  const user = await requireAuth()

  return prisma.notification.findMany({
    where: { userId: user.id, isDismissed: false },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      isRead: true,
      createdAt: true,
    },
  })
}

export async function markNotificationAsRead(id: string) {
  const user = await requireAuth()

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  })

  revalidatePath("/")
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuth()

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })

  revalidatePath("/")
}

export async function deleteNotification(id: string) {
  const user = await requireAuth()

  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
    select: { relatedEntity: true },
  })

  if (!notification) {
    return
  }

  const entity = notification.relatedEntity as { type?: string } | null

  // Hard delete pour les objectifs : l'état ne peut pas revenir en arrière
  // Soft delete pour les budgets : l'alerte peut réapparaître le mois suivant
  if (entity?.type === "goal") {
    await prisma.notification.delete({ where: { id } })
  } else {
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isDismissed: true },
    })
  }
}

export async function deleteAllNotifications() {
  const user = await requireAuth()

  await prisma.notification.updateMany({
    where: { userId: user.id, isDismissed: false },
    data: { isDismissed: true },
  })
}
