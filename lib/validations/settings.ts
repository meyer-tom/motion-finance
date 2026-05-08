import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(50),
  lastName: z.string().min(1, "Le nom est requis").max(50),
  image: z.string().url().nullable().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updateCurrencySchema = z.object({
  currency: z
    .string()
    .length(3, "Le code devise doit faire 3 caractères")
    .toUpperCase(),
})

export type UpdateCurrencyInput = z.infer<typeof updateCurrencySchema>

export const deleteAccountSchema = z.object({
  confirmation: z.literal("SUPPRIMER"),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
