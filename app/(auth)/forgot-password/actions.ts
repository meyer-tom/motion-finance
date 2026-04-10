"use server"

import { auth } from "@/lib/auth"
import { forgotPasswordSchema } from "@/lib/validations/auth"

export type ForgotPasswordActionState =
  | { success: true }
  | {
      success: false
      errors: Partial<Record<"email" | "root", string>>
    }

export async function forgotPasswordAction(
  data: unknown
): Promise<ForgotPasswordActionState> {
  const parsed = await forgotPasswordSchema.safeParseAsync(data)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      success: false,
      errors: { email: fieldErrors.email?.[0] },
    }
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo: "/reset-password",
      },
    })
  } catch {
    // Ne pas révéler si l'email existe (protection timing attack)
  }

  // Toujours retourner succès
  return { success: true }
}
