"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth/client"

export default function VerifyEmailPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      const timer = setTimeout(() => router.push("/dashboard"), 2500)
      return () => clearTimeout(timer)
    }
  }, [session, router])

  if (session?.user) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-income)]/15">
            <CheckCircle2 className="h-7 w-7 text-[var(--color-income)]" />
          </div>
          <h2 className="font-bold text-foreground text-xl tracking-tight">
            Email vérifié !
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
            Votre adresse a été confirmée. Redirection vers le tableau de bord…
          </p>
          <Button
            asChild
            className="btn-gradient-primary mt-6 w-full hover:opacity-90"
          >
            <Link href="/dashboard">Accéder au dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-border bg-card/60 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="font-bold text-foreground text-xl tracking-tight">
          Lien invalide
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm leading-relaxed">
          Ce lien de vérification est invalide ou a expiré. Connectez-vous pour
          en recevoir un nouveau.
        </p>
        <Button
          asChild
          className="btn-gradient-primary mt-6 w-full hover:opacity-90"
        >
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </div>
  )
}
