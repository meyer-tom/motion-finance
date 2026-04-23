import { z } from "zod"

const cuidRegex = /^c[a-z0-9]{24}$/
const cuid = (message: string) => z.string().regex(cuidRegex, message)

export const recurringSchema = z
  .object({
    name: z
      .string()
      .min(1, "Le nom est requis")
      .max(100, "100 caractères maximum"),
    type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
    amount: z
      .number()
      .positive("Le montant doit être positif")
      .max(10_000_000, "Montant maximum : 10 000 000"),
    description: z.string().max(255, "255 caractères maximum").optional(),
    categoryId: cuid("Catégorie invalide").nullable().optional(),
    accountId: cuid("Compte invalide"),
    toAccountId: cuid("Compte de destination invalide").nullable().optional(),
    frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "TRANSFER" && !data.categoryId) {
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "La catégorie est requise pour une dépense ou un revenu",
      })
    }

    if (data.type === "TRANSFER") {
      if (!data.toAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["toAccountId"],
          message: "Le compte de destination est requis pour un virement",
        })
      } else if (data.toAccountId === data.accountId) {
        ctx.addIssue({
          code: "custom",
          path: ["toAccountId"],
          message:
            "Le compte de destination doit être différent du compte source",
        })
      }
    }
  })

export type RecurringInput = z.infer<typeof recurringSchema>
