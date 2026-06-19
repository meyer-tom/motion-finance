"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { forgotPasswordAction } from "@/app/(auth)/forgot-password/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/validations/auth"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setRootError(null)

    const result = await forgotPasswordAction(data)

    if (!result.success) {
      if (result.errors.email) {
        setRootError(result.errors.email)
      } else {
        setRootError("Une erreur est survenue. Réessayez.")
      }
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-income)]/15">
            <CheckCircle2 className="h-7 w-7 text-[var(--color-income)]" />
          </div>
          <h2 className="font-bold text-foreground text-xl tracking-tight">
            Email envoyé
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
            Si cette adresse correspond à un compte, vous recevrez un lien de
            réinitialisation dans quelques instants.
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
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-bold text-2xl text-foreground tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="mt-1.5 text-muted-foreground text-sm">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
        <form
          className="flex flex-col gap-5"
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
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                aria-invalid={!!errors.email}
                autoComplete="email"
                className="h-11 border-border bg-background/50 pl-10 focus:border-primary"
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
                Envoi…
              </>
            ) : (
              "Envoyer le lien"
            )}
          </Button>

          <Link
            className="text-center text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/login"
          >
            ← Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  )
}
