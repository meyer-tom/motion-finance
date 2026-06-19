"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Eye, EyeOff, Loader2, Lock, Mail, MailCheck, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { registerAction } from "@/app/(auth)/register/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth/client"
import { type RegisterInput, registerSchema } from "@/lib/validations/auth"

export default function RegisterPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setRootError(null)

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
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-black/5 shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-bold text-xl tracking-tight">
            Vérifiez votre email
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
            Un lien de confirmation a été envoyé. Cliquez dessus pour activer
            votre compte.
          </p>
          <Link
            className="mt-6 inline-block text-primary text-sm transition-opacity hover:opacity-80"
            href="/login"
          >
            Retour à la connexion →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-2xl tracking-tight">Créer un compte</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Déjà inscrit ?{" "}
          <Link
            className="font-medium text-primary transition-opacity hover:opacity-80"
            href="/login"
          >
            Se connecter
          </Link>
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-black/5 shadow-xl">
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                htmlFor="firstName"
              >
                Prénom
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  aria-invalid={!!errors.firstName}
                  autoComplete="given-name"
                  className="h-11 border-border bg-background/80 pl-10"
                  id="firstName"
                  placeholder="Jean"
                  {...register("firstName")}
                />
              </div>
              {errors.firstName ? (
                <p className="text-destructive text-xs">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                htmlFor="lastName"
              >
                Nom
              </Label>
              <div className="relative">
                <Input
                  aria-invalid={!!errors.lastName}
                  autoComplete="family-name"
                  className="h-11 border-border bg-background/80"
                  id="lastName"
                  placeholder="Dupont"
                  {...register("lastName")}
                />
              </div>
              {errors.lastName ? (
                <p className="text-destructive text-xs">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
              htmlFor="email"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                aria-invalid={!!errors.email}
                autoComplete="email"
                className="h-11 border-border bg-background/80 pl-10"
                id="email"
                placeholder="vous@exemple.fr"
                type="email"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
              htmlFor="password"
            >
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                aria-invalid={!!errors.password}
                autoComplete="new-password"
                className="h-11 border-border bg-background/80 pr-10 pl-10"
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                aria-label={showPassword ? "Masquer" : "Afficher"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label
              className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
              htmlFor="confirmPassword"
            >
              Confirmer
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                aria-invalid={!!errors.confirmPassword}
                autoComplete="new-password"
                className="h-11 border-border bg-background/80 pr-10 pl-10"
                id="confirmPassword"
                placeholder="••••••••"
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
              />
              <button
                aria-label={showConfirm ? "Masquer" : "Afficher"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                type="button"
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-destructive text-xs">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {rootError ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-center text-destructive text-sm">
              {rootError}
            </p>
          ) : null}

          <Button
            className="btn-gradient-primary h-11 w-full font-semibold hover:opacity-90"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Création…
              </>
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
