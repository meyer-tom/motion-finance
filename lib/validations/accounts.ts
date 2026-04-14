import { z } from "zod"

export const createAccountSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  type: z.enum(["CHECKING", "SAVINGS"]),
  startingBalance: z
    .number()
    .min(-1_000_000, "Solde minimum : −1 000 000")
    .max(10_000_000, "Solde maximum : 10 000 000"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
  icon: z.string().min(1, "L'icône est requise"),
})

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  type: z.enum(["CHECKING", "SAVINGS"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
  icon: z.string().min(1, "L'icône est requise"),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
