"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { loginAction } from "@/app/(auth)/login/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"
import { loginSchema } from "@/lib/validations/auth"

type LoginFormValues = z.input<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [rootError, setRootError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle"
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  const rememberMe = watch("rememberMe")

  async function onSubmit(data: LoginFormValues) {
    setRootError(null)
    setUnverifiedEmail(null)

    // Validation côté serveur
    const serverResult = await loginAction(data)
    if (!serverResult.success) {
      if (serverResult.errors.root) {
        setRootError(serverResult.errors.root)
      }
      return
    }

    // Authentification Better Auth
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe ?? false,
    })

    if (error) {
      if (
        error.code === "EMAIL_NOT_VERIFIED" ||
        error.message?.toLowerCase().includes("email not verified")
      ) {
        setUnverifiedEmail(data.email)
        return
      }

      setRootError(
        error.message === "Invalid email or password"
          ? "Email ou mot de passe incorrect"
          : "Une erreur est survenue. Réessayez."
      )
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function handleResendVerification() {
    if (!unverifiedEmail || resendStatus !== "idle") {
      return
    }
    setResendStatus("sending")
    await authClient.sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/verify-email",
    })
    setResendStatus("sent")
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Connexion</CardTitle>
        <CardDescription>
          Pas encore de compte ?{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/register"
          >
            S&apos;inscrire
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col gap-4"
          method="post"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              aria-invalid={!!errors.email}
              autoComplete="email"
              id="email"
              placeholder="vous@exemple.fr"
              type="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                className="text-muted-foreground text-xs underline-offset-4 hover:underline"
                href="/forgot-password"
                tabIndex={-1}
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              aria-invalid={!!errors.password}
              autoComplete="current-password"
              id="password"
              placeholder="••••••••"
              type="password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {/* Rester connecté */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={rememberMe}
              id="rememberMe"
              onCheckedChange={(checked) =>
                setValue("rememberMe", checked === true)
              }
            />
            <Label className="font-normal" htmlFor="rememberMe">
              Rester connecté
            </Label>
          </div>

          {/* Erreur email non vérifié */}
          {unverifiedEmail ? (
            <div className="rounded-lg bg-amber-50 px-3 py-3 text-center text-sm dark:bg-amber-900/20">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Adresse email non vérifiée
              </p>
              <p className="mt-1 text-amber-700 dark:text-amber-400">
                Vérifiez votre boîte email ou renvoyez le lien de confirmation.
              </p>
              <Button
                className="mt-2 h-auto px-3 py-1.5 text-xs"
                disabled={resendStatus !== "idle"}
                onClick={handleResendVerification}
                size="sm"
                type="button"
                variant="outline"
              >
                {resendStatus === "sending" && "Envoi…"}
                {resendStatus === "sent" && "Email envoyé !"}
                {resendStatus === "idle" && "Renvoyer l'email de vérification"}
              </Button>
            </div>
          ) : null}

          {/* Erreur globale */}
          {rootError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">
              {rootError}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
