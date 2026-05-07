import { z } from "zod"

const cuidRegex = /^c[a-z0-9]{24}$/
const cuid = (message: string) => z.string().regex(cuidRegex, message)

export const createGoalSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  targetAmount: z
    .number()
    .positive("Le montant cible doit être positif")
    .max(10_000_000, "Montant maximum : 10 000 000"),
  currentAmount: z
    .number()
    .min(0, "Le montant actuel ne peut pas être négatif")
    .max(10_000_000, "Montant maximum : 10 000 000")
    .default(0),
  deadline: z.coerce.date().optional(),
  accountId: cuid("Compte invalide").optional(),
})

export const updateGoalSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  targetAmount: z
    .number()
    .positive("Le montant cible doit être positif")
    .max(10_000_000, "Montant maximum : 10 000 000"),
  currentAmount: z
    .number()
    .min(0, "Le montant actuel ne peut pas être négatif")
    .max(10_000_000, "Montant maximum : 10 000 000"),
  deadline: z.coerce.date().optional(),
  accountId: cuid("Compte invalide").optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
