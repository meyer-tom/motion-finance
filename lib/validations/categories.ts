import { z } from "zod"

export const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  type: z.enum(["EXPENSE", "INCOME"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
  icon: z.string().min(1, "L'icône est requise"),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  type: z.enum(["EXPENSE", "INCOME"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
  icon: z.string().min(1, "L'icône est requise"),
})

export const updateSystemCategoryAppearanceSchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
  icon: z.string().min(1, "L'icône est requise"),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type UpdateSystemCategoryAppearanceInput = z.infer<typeof updateSystemCategoryAppearanceSchema>
