import { z } from "zod"

export const bugReportSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(120, "Titre trop long (max 120 caractères)"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(5000, "Description trop longue (max 5000 caractères)"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  pageUrl: z.string().max(500),
  userAgent: z.string().max(500),
  screenshotUrl: z.string().url().optional(),
})

export type BugReportInput = z.infer<typeof bugReportSchema>

export const updateBugStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "WONT_FIX"]),
})
