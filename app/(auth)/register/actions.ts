"use server"

import { registerServerSchema } from "@/lib/validations/auth"

export type RegisterActionState =
  | { success: true }
  | {
      success: false
      errors: Partial<
        Record<"firstName" | "lastName" | "email" | "root", string>
      >
    }

export async function registerAction(
  data: unknown
): Promise<RegisterActionState> {
  const parsed = await registerServerSchema.safeParseAsync(data)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      success: false,
      errors: {
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
      },
    }
  }

  return { success: true }
}
