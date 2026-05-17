"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"

import { resetPasswordAction } from "@/app/(auth)/reset-password/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/validations/auth"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [status, setStatus] = useState<"idle" | "success" | "token-error">(
    "idle"
  )
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [rootError, setRootError] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: standardSchemaResolver(resetPasswordSchema),
  })

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-bold text-xl text-foreground tracking-tight">
            Lien invalide
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Button asChild className="btn-gradient-primary mt-6 w-full hover:opacity-90">
            <Link href="/forgot-password">Nouvelle demande</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-income)]/15">
            <CheckCircle2 className="h-7 w-7 text-[var(--color-income)]" />
          </div>
          <h2 className="font-bold text-xl text-foreground tracking-tight">
            Mot de passe modifié
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <Button asChild className="btn-gradient-primary mt-6 w-full hover:opacity-90">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (status === "token-error" && tokenError) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-bold text-xl text-foreground tracking-tight">
            Lien expiré
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
            {tokenError}
          </p>
          <Button asChild className="btn-gradient-primary mt-6 w-full hover:opacity-90">
            <Link href="/forgot-password">Nouvelle demande</Link>
          </Button>
        </div>
      </div>
    )
  }

  async function onSubmit(data: ResetPasswordInput) {
    setRootError(null)

    const result = await resetPasswordAction(token, data)

    if (!result.success) {
      if (result.errors.token) {
        setTokenError(result.errors.token)
        setStatus("token-error")
        return
      }
      if (result.errors.root) {
        setRootError(result.errors.root)
      }
      return
    }

    setStatus("success")
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-bold text-2xl text-foreground tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="newPassword">
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                aria-invalid={!!errors.newPassword}
                autoComplete="new-password"
                className="pl-10 pr-10 h-11 bg-background/50 border-border focus:border-primary"
                id="newPassword"
                placeholder="••••••••"
                type={showNew ? "text" : "password"}
                {...register("newPassword")}
              />
              <button
                aria-label={showNew ? "Masquer" : "Afficher"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => setShowNew((v) => !v)}
                type="button"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="text-destructive text-xs">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="confirmPassword">
              Confirmer
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                aria-invalid={!!errors.confirmPassword}
                autoComplete="new-password"
                className="pl-10 pr-10 h-11 bg-background/50 border-border focus:border-primary"
                id="confirmPassword"
                placeholder="••••••••"
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
              />
              <button
                aria-label={showConfirm ? "Masquer" : "Afficher"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                type="button"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-destructive text-xs">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {rootError ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-center text-destructive text-sm">
              {rootError}
            </p>
          ) : null}

          <Button
            className="btn-gradient-primary h-11 w-full font-medium hover:opacity-90"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Réinitialisation…
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
            <p className="text-muted-foreground text-sm">Chargement…</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
