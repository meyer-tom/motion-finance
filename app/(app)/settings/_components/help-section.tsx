"use client"

import { RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { resetOnboarding } from "@/lib/actions/settings"

export function HelpSection() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleReset() {
    startTransition(async () => {
      try {
        await resetOnboarding()
        router.push("/onboarding")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tutoriel d'introduction</CardTitle>
          <CardDescription>
            Revoir les étapes de démarrage et les conseils d'utilisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button disabled={isPending} onClick={handleReset} type="button" variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            {isPending ? "Redirection…" : "Revoir le tutoriel"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Votre progression et vos données ne seront pas supprimées — seules
            les étapes de l'onboarding seront réinitialisées.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
