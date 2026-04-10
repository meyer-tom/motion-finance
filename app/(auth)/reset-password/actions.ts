"use server"

import { auth } from "@/lib/auth"
import { resetPasswordSchema } from "@/lib/validations/auth"

export type ResetPasswordActionState =
  | { success: true }
  | {
      success: false
      errors: Partial<
        Record<"newPassword" | "confirmPassword" | "token" | "root", string>
      >
    }

export async function resetPasswordAction(
  token: string,
  data: unknown
): Promise<ResetPasswordActionState> {
  if (!token) {
    return {
      success: false,
      errors: { token: "Lien de réinitialisation invalide ou expiré." },
    }
  }

  const parsed = await resetPasswordSchema.safeParseAsync(data)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      success: false,
      errors: {
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    }
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: parsed.data.newPassword,
        token,
      },
    })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ""

    if (message.includes("expired") || message.includes("expiré")) {
      return {
        success: false,
        errors: {
          token:
            "Ce lien a expiré. Faites une nouvelle demande de réinitialisation.",
        },
      }
    }

    if (
      message.includes("invalid") ||
      message.includes("not found") ||
      message.includes("invalide")
    ) {
      return {
        success: false,
        errors: {
          token:
            "Lien de réinitialisation invalide. Faites une nouvelle demande.",
        },
      }
    }

    return {
      success: false,
      errors: { root: "Une erreur est survenue. Réessayez." },
    }
  }
}
