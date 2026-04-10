"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSession } from "@/lib/auth/client"

export default function VerifyEmailPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Si l'utilisateur est connecté (autoSignInAfterVerification), on redirige vers le dashboard
  useEffect(() => {
    if (session?.user) {
      const timer = setTimeout(() => router.push("/dashboard"), 2500)
      return () => clearTimeout(timer)
    }
  }, [session, router])

  if (session?.user) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">Email vérifié !</CardTitle>
          <CardDescription>
            Votre adresse email a été confirmée. Vous allez être redirigé vers
            le tableau de bord…
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/dashboard">Accéder au tableau de bord</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">Lien invalide ou expiré</CardTitle>
        <CardDescription>
          Ce lien de vérification est invalide ou a expiré. Connectez-vous pour
          en recevoir un nouveau.
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
