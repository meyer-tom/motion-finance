"use client"

import { RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
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
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="font-semibold text-base">Tutoriel d'introduction</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Revoir les étapes de démarrage et les conseils d'utilisation
          </p>
        </div>
        <div className="space-y-3 px-6 py-6">
          <Button disabled={isPending} onClick={handleReset} type="button" variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            {isPending ? "Redirection…" : "Revoir le tutoriel"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Votre progression et vos données ne seront pas supprimées — seules
            les étapes de l'onboarding seront réinitialisées.
          </p>
        </div>
      </div>
    </div>
  )
}
