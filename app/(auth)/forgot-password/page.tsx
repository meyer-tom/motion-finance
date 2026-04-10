"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { forgotPasswordAction } from "@/app/(auth)/forgot-password/actions"
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
    resolver: zodResolver(forgotPasswordSchema),
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
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">Email envoyé</CardTitle>
          <CardDescription>
            Si cette adresse correspond à un compte, vous recevrez un lien de
            réinitialisation dans quelques instants. Vérifiez vos spams si
            nécessaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="block text-center text-muted-foreground text-sm underline-offset-4 hover:underline"
            href="/login"
          >
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
        <CardDescription>
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
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

          {rootError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">
              {rootError}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Envoi…" : "Envoyer le lien"}
          </Button>

          <Link
            className="text-center text-muted-foreground text-sm underline-offset-4 hover:underline"
            href="/login"
          >
            Retour à la connexion
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
