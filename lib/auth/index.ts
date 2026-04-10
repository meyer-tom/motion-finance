import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db"
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email"

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
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
