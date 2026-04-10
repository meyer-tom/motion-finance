"use server"

import { loginSchema } from "@/lib/validations/auth"

export type LoginActionState =
  | { success: true }
  | {
      success: false
      errors: Partial<Record<"email" | "password" | "root", string>>
    }

export async function loginAction(data: unknown): Promise<LoginActionState> {
  const parsed = await loginSchema.safeParseAsync(data)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      success: false,
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    }
  }

  return { success: true }
}
