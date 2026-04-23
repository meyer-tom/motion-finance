import { z } from "zod"

const cuidRegex = /^c[a-z0-9]{24}$/
const cuid = (message: string) => z.string().regex(cuidRegex, message)

export const budgetSchema = z.object({
  categoryId: cuid("Catégorie invalide"),
  amount: z
    .number()
    .positive("Le montant doit être positif")
    .max(10_000_000, "Montant maximum : 10 000 000"),
  month: z.coerce.date(),
})

export type BudgetInput = z.infer<typeof budgetSchema>
