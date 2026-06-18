"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { type Resolver, useForm } from "react-hook-form"
import { toast } from "@/lib/toast"
import { BarChartSvg } from "@/components/app/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeOnboarding } from "@/lib/actions/onboarding"
import {
  type CompleteOnboardingInput,
  completeOnboardingSchema,
} from "@/lib/validations/onboarding"

interface OnboardingStepperProps {
  firstName: string
}

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Étape ${current} sur 2`}>
      <div className="h-2 w-2 rounded-full bg-primary" />
      <div
        className="h-px w-8 transition-colors duration-300"
        style={{ backgroundColor: current === 2 ? "var(--primary)" : "var(--border)" }}
      />
      <div
        className="h-2 w-2 rounded-full transition-colors duration-300"
        style={{ backgroundColor: current === 2 ? "var(--primary)" : "var(--border)" }}
      />
    </div>
  )
}

export function OnboardingStepper({ firstName }: OnboardingStepperProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CompleteOnboardingInput>({
    resolver: standardSchemaResolver(completeOnboardingSchema) as Resolver<CompleteOnboardingInput>,
    defaultValues: { name: "Compte courant", startingBalance: 0 },
  })

  function onSubmit(data: CompleteOnboardingInput) {
    startTransition(async () => {
      try {
        await completeOnboarding(data)
        toast.success("Compte créé avec succès !")
        router.push("/dashboard")
      } catch (err) {
        setError("root", {
          message: err instanceof Error ? err.message : "Une erreur est survenue",
        })
      }
    })
  }

  return (
    <Card className="w-full gap-0 overflow-hidden p-0 shadow-xl">

      {/* ── Header gradient ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 px-6 py-8">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" />
        <div className="absolute -bottom-14 -left-6 h-36 w-36 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <BarChartSvg size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-[-0.04em] text-white">
            Motion <span className="text-violet-200">Finance</span>
          </span>
        </div>

        {/* Titre slidé */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: step === 1 ? "translateX(0)" : "translateX(-100%)" }}
          >
            <div className="w-full shrink-0">
              <h1 className="text-2xl font-bold leading-tight text-white">
                Bonjour, {firstName}&nbsp;!
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-violet-200">
                Quelques secondes pour configurer votre espace.
              </p>
            </div>
            <div className="w-full shrink-0">
              <h1 className="text-2xl font-bold leading-tight text-white">
                Votre premier compte
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-violet-200">
                Renseignez votre compte courant principal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Corps ───────────────────────────────────────────────── */}
      <div className="px-6 py-6">

        {/* Indicateur */}
        <div className="mb-6 flex items-center justify-between">
          <StepDots current={step} />
          <span className="tabular-nums text-muted-foreground text-xs">{step} / 2</span>
        </div>

        {/* Contenu glissant */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: step === 1 ? "translateX(0)" : "translateX(-100%)" }}
          >

            {/* Étape 1 */}
            <div className="w-full shrink-0">
              <ul className="space-y-3">
                {[
                  "Suivi de vos comptes et transactions",
                  "Budgets par catégorie avec alertes",
                  "Objectifs d'épargne personnalisés",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="mt-8 w-full cursor-pointer"
                onClick={() => setStep(2)}
                type="button"
              >
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Étape 2 */}
            <div className="w-full shrink-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du compte</Label>
                  <Input
                    id="name"
                    placeholder="Ex : Compte courant BNP"
                    autoComplete="off"
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p className="text-destructive text-xs" role="alert">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startingBalance">Solde actuel (€)</Label>
                  <Input
                    id="startingBalance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    inputMode="decimal"
                    {...register("startingBalance")}
                  />
                  {errors.startingBalance ? (
                    <p className="text-destructive text-xs" role="alert">
                      {errors.startingBalance.message}
                    </p>
                  ) : null}
                </div>

                {errors.root ? (
                  <p className="text-destructive text-sm" role="alert">
                    {errors.root.message}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full cursor-pointer"
                    disabled={isPending}
                  >
                    {isPending ? "Création en cours…" : "Créer mon compte"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-muted-foreground"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                  >
                    Retour
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </Card>
  )
}
