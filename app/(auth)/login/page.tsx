"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { loginAction } from "@/app/(auth)/login/actions"
import { Button } from "@/components/ui/button"
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
  const [showPassword, setShowPassword] = useState(false)

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

    const serverResult = await loginAction(data)
    if (!serverResult.success) {
      if (serverResult.errors.root) {
        setRootError(serverResult.errors.root)
      }
      return
    }

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
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-2xl tracking-tight">Bon retour</h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Pas encore de compte ?{" "}
          <Link
            className="font-medium text-primary transition-opacity hover:opacity-80"
            href="/register"
          >
            S&apos;inscrire gratuitement
          </Link>
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-black/5 shadow-xl">
        <form
          className="flex flex-col gap-5"
          method="post"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
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
            <div className="flex items-center justify-between">
              <Label
                className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
                htmlFor="password"
              >
                Mot de passe
              </Label>
              <Link
                className="text-muted-foreground text-xs transition-colors hover:text-primary"
                href="/forgot-password"
                tabIndex={-1}
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                aria-invalid={!!errors.password}
                autoComplete="current-password"
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

          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={rememberMe}
              id="rememberMe"
              onCheckedChange={(checked) =>
                setValue("rememberMe", checked === true)
              }
            />
            <Label
              className="cursor-pointer font-normal text-muted-foreground text-sm"
              htmlFor="rememberMe"
            >
              Rester connecté
            </Label>
          </div>

          {unverifiedEmail ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center">
              <p className="font-medium text-amber-300 text-sm">
                Email non vérifié
              </p>
              <p className="mt-1 text-amber-400/80 text-xs">
                Vérifiez votre boîte email ou renvoyez le lien.
              </p>
              <Button
                className="mt-2.5 h-7 border-amber-500/30 px-3 text-amber-300 text-xs hover:bg-amber-500/10"
                disabled={resendStatus !== "idle"}
                onClick={handleResendVerification}
                size="sm"
                type="button"
                variant="outline"
              >
                {resendStatus === "sending" && "Envoi…"}
                {resendStatus === "sent" && "Email envoyé !"}
                {resendStatus === "idle" && "Renvoyer l'email"}
              </Button>
            </div>
          ) : null}

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
                Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
