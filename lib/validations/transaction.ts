import { z } from "zod"

// En Zod v4, .cuid() est déprécié — on valide avec un pattern cuid (c + 24 alphanum)
const cuidRegex = /^c[a-z0-9]{24}$/

const cuid = (message: string) => z.string().regex(cuidRegex, message)

export const transactionSchema = z
  .object({
    type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
    amount: z
      .number()
      .positive("Le montant doit être positif")
      .max(10_000_000, "Montant maximum : 10 000 000"),
    date: z.coerce.date(),
    accountId: cuid("Compte invalide"),
    categoryId: cuid("Catégorie invalide").nullable().optional(),
    toAccountId: cuid("Compte de destination invalide").nullable().optional(),
    description: z.string().max(255, "255 caractères maximum").optional(),
    tags: z
      .array(z.string().max(30, "Un tag ne peut pas dépasser 30 caractères"))
      .max(10, "Maximum 10 tags")
      .default([]),
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

export const transactionFiltersSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]).optional(),
  accountId: cuid("Compte invalide").optional(),
  categoryId: cuid("Catégorie invalide").optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(100).optional(),
  cursor: cuid("Curseur invalide").optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>
