"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  Landmark,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { type Resolver, useForm } from "react-hook-form"
import { BarChartSvg } from "@/components/app/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeOnboarding } from "@/lib/actions/onboarding"
import { toast } from "@/lib/toast"
import {
  type CompleteOnboardingInput,
  completeOnboardingSchema,
} from "@/lib/validations/onboarding"

interface OnboardingStepperProps {
  firstName: string
}

const FEATURES = [
  { icon: Landmark, label: "Suivi de vos comptes et transactions" },
  { icon: BarChart3, label: "Budgets par catégorie avec alertes" },
  { icon: Target, label: "Objectifs d'épargne personnalisés" },
]

function StepIndicator({ current }: Readonly<{ current: 1 | 2 }>) {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{`Étape ${current} sur 2`}</span>
      <div className="size-2 rounded-full bg-primary" />
      <div
        className="h-px w-10 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: current === 2 ? "var(--primary)" : "var(--border)",
        }}
      />
      <div
        className="size-2 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: current === 2 ? "var(--primary)" : "var(--border)",
        }}
      />
    </div>
  )
}

export function OnboardingStepper({
  firstName,
}: Readonly<OnboardingStepperProps>) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CompleteOnboardingInput>({
    resolver: standardSchemaResolver(
      completeOnboardingSchema
    ) as Resolver<CompleteOnboardingInput>,
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
          message:
            err instanceof Error ? err.message : "Une erreur est survenue",
        })
      }
    })
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
      {/* ── Header gradient ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary to-blue-600 px-8 py-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative mb-8 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <BarChartSvg size={20} />
          </div>
          <span className="font-extrabold text-lg text-white tracking-[-0.03em]">
            Motion <span className="text-blue-200">Finance</span>
          </span>
        </div>

        {/* Titre — slide entre les deux étapes */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: step === 1 ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="w-full shrink-0">
              <p className="mb-1 font-medium text-blue-200 text-sm uppercase tracking-widest">
                Bienvenue
              </p>
              <h1 className="font-black text-3xl text-white leading-tight tracking-tight">
                Bonjour,&nbsp;{firstName}&nbsp;!
              </h1>
              <p className="mt-2 text-blue-100/80 text-sm leading-relaxed">
                Quelques secondes pour configurer votre espace.
              </p>
            </div>
            <div className="w-full shrink-0">
              <p className="mb-1 font-medium text-blue-200 text-sm uppercase tracking-widest">
                Étape 2 / 2
              </p>
              <h1 className="font-black text-3xl text-white leading-tight tracking-tight">
                Votre premier compte
              </h1>
              <p className="mt-2 text-blue-100/80 text-sm leading-relaxed">
                Renseignez votre compte courant principal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Corps ───────────────────────────────────────────────────── */}
      <div className="px-8 py-8">
        {/* Indicateur d'étape */}
        <div className="mb-8 flex items-center justify-between">
          <StepIndicator current={step} />
          <span className="text-muted-foreground text-xs tabular-nums">
            {step} / 2
          </span>
        </div>

        {/* Contenu glissant */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: step === 1 ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            {/* Étape 1 — présentation */}
            <div className="w-full shrink-0">
              <ul className="space-y-3">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <li className="flex items-center gap-4" key={label}>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <span className="text-foreground/80 text-sm">{label}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="btn-gradient-primary mt-8 h-12 w-full gap-2 rounded-full font-semibold shadow-md hover:opacity-90"
                onClick={() => setStep(2)}
                type="button"
              >
                Commencer
                <ArrowRight className="size-4" />
              </Button>
            </div>

            {/* Étape 2 — formulaire */}
            <div className="w-full shrink-0">
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du compte</Label>
                  <Input
                    autoComplete="off"
                    id="name"
                    placeholder="Ex : Compte courant BNP"
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
                    inputMode="decimal"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
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

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    className="btn-gradient-primary h-12 w-full gap-2 rounded-full font-semibold shadow-md hover:opacity-90"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? "Création en cours…" : "Créer mon compte"}
                  </Button>
                  <Button
                    className="gap-1.5 text-muted-foreground"
                    disabled={isPending}
                    onClick={() => setStep(1)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <ChevronLeft className="size-3.5" />
                    Retour
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
