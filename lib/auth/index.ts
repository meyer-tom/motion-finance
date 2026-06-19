import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db"
import {
  sendEmailChangeVerification,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email"

function ensureUrl(raw: string | undefined): string {
  if (!raw) return ""
  return raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : `https://${raw}`
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
        userName: user.name,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Ajouter callbackURL pour rediriger vers notre page de confirmation
      const verifyUrl = new URL(url)
      verifyUrl.searchParams.set("callbackURL", "/verify-email")
      await sendVerificationEmail({
        to: user.email,
        verifyUrl: verifyUrl.toString(),
        userName: user.name,
      })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24, // 1 jour
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      currency: {
        type: "string",
        required: false,
        defaultValue: "EUR",
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url,
      }: {
        newEmail: string
        url: string
        user: { email: string; firstName?: string | null; name: string }
      }) => {
        await sendEmailChangeVerification({
          to: newEmail,
          verifyUrl: url,
          userName: user.firstName ?? user.name,
          newEmail,
        })
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: ensureUrl(process.env.BETTER_AUTH_URL),
  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(",").map((o) => o.trim())
    : [process.env.NEXT_PUBLIC_APP_URL!],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
