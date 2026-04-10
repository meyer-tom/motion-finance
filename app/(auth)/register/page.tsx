"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { registerAction } from "@/app/(auth)/register/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"
import { type RegisterInput, registerSchema } from "@/lib/validations/auth"

export default function RegisterPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setRootError(null)

    // Validation côté serveur (champs non-sensibles uniquement — pas de mot de passe)
    const serverResult = await registerAction({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    })
    if (!serverResult.success) {
      if (serverResult.errors.root) {
        setRootError(serverResult.errors.root)
      }
      return
    }

    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    if (error) {
      console.error("[register] Better Auth error:", error)
      if (
        error.message?.toLowerCase().includes("email") ||
        error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      ) {
        setRootError("Cette adresse email est déjà utilisée.")
      } else {
        setRootError(
          `Erreur (${error.code ?? error.status}): ${error.message ?? "Réessayez."}`
        )
      }
      return
    }

    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Vérifiez votre email</CardTitle>
          <CardDescription>
            Un email de confirmation a été envoyé à votre adresse. Cliquez sur
            le lien dans l&apos;email pour activer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground text-sm">
            Vous pouvez fermer cette page.{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/login"
            >
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Créer un compte</CardTitle>
        <CardDescription>
          Déjà inscrit ?{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/login"
          >
            Se connecter
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                aria-invalid={!!errors.firstName}
                autoComplete="given-name"
                id="firstName"
                placeholder="Jean"
                {...register("firstName")}
              />
              {errors.firstName ? (
                <p className="text-destructive text-xs">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                aria-invalid={!!errors.lastName}
                autoComplete="family-name"
                id="lastName"
                placeholder="Dupont"
                {...register("lastName")}
              />
              {errors.lastName ? (
                <p className="text-destructive text-xs">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

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
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              aria-invalid={!!errors.password}
              autoComplete="new-password"
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

          {/* Confirmation mot de passe */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              aria-invalid={!!errors.confirmPassword}
              autoComplete="new-password"
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-destructive text-xs">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {/* Erreur globale */}
          {rootError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">
              {rootError}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Création…" : "Créer mon compte"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
