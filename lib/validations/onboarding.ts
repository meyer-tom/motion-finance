import { z } from "zod"

export const completeOnboardingSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50, "50 caractères maximum"),
  startingBalance: z
    .coerce.number()
    .min(-1_000_000, "Solde minimum : −1 000 000")
    .max(10_000_000, "Solde maximum : 10 000 000"),
})

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>
