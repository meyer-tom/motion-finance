"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { resetPasswordAction } from "@/app/(auth)/reset-password/actions"
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Lien invalide</CardTitle>
          <CardDescription>
            Ce lien de réinitialisation est invalide ou a expiré. Faites une
            nouvelle demande.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Nouvelle demande</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">Mot de passe modifié</CardTitle>
          <CardDescription>
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez
            maintenant vous connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "token-error" && tokenError) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Lien expiré</CardTitle>
          <CardDescription>{tokenError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Nouvelle demande</Link>
          </Button>
        </CardContent>
      </Card>
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
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Nouveau mot de passe</CardTitle>
        <CardDescription>
          Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              aria-invalid={!!errors.newPassword}
              autoComplete="new-password"
              id="newPassword"
              placeholder="••••••••"
              type="password"
              {...register("newPassword")}
            />
            {errors.newPassword ? (
              <p className="text-destructive text-xs">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

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

          {rootError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">
              {rootError}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Réinitialisation…"
              : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Chargement…</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
