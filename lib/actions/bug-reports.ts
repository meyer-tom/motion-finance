"use server"

import { revalidatePath } from "next/cache"
import { getAuthSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db"
import { sendBugReportEmail } from "@/lib/email"
import {
  type BugReportInput,
  bugReportSchema,
  updateBugStatusSchema,
} from "@/lib/validations/bug-reports"

async function requireAuth() {
  const session = await getAuthSession()
  if (!session) {
    throw new Error("Non authentifié")
  }
  return session.user
}

async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    throw new Error("Accès refusé")
  }
  return user
}

export async function submitBugReport(data: BugReportInput) {
  const user = await requireAuth()

  const parsed = bugReportSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides")
  }

  const report = await prisma.bugReport.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      severity:
        parsed.data.type === "BUG"
          ? (parsed.data.severity ?? "MEDIUM")
          : undefined,
      pageUrl: parsed.data.pageUrl,
      userAgent: parsed.data.userAgent,
      screenshotUrl: parsed.data.screenshotUrl,
    },
  })

  const emailPrefix =
    parsed.data.type === "FEATURE_REQUEST" ? "[Feature]" : "[Bug]"

  await sendBugReportEmail({
    reportId: report.id,
    type: parsed.data.type,
    title: report.title,
    description: report.description,
    severity: report.severity ?? "N/A",
    pageUrl: report.pageUrl,
    reporterName: `${user.firstName} ${user.lastName}`.trim(),
    reporterEmail: user.email,
    screenshotUrl: report.screenshotUrl ?? undefined,
    emailPrefix,
  })

  return { id: report.id }
}

export async function getBugReports(status?: string) {
  await requireAdmin()

  return prisma.bugReport.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      severity: true,
      status: true,
      pageUrl: true,
      userAgent: true,
      screenshotUrl: true,
      createdAt: true,
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  })
}

export async function updateBugReportStatus(id: string, status: string) {
  await requireAdmin()

  const parsed = updateBugStatusSchema.safeParse({ id, status })
  if (!parsed.success) {
    throw new Error("Données invalides")
  }

  await prisma.bugReport.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  })

  revalidatePath("/admin/bugs")
}

export async function deleteBugReport(id: string) {
  await requireAdmin()
  await prisma.bugReport.delete({ where: { id } })
  revalidatePath("/admin/bugs")
}
