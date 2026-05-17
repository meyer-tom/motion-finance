"use client"

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

const STEPS = [
  {
    id: "account",
    label: "Créer votre premier compte courant",
    href: "/accounts",
  },
  {
    id: "savings",
    label: "Ajouter un compte épargne",
    href: "/accounts",
  },
  {
    id: "profile",
    label: "Compléter votre profil",
    href: "/settings",
  },
  {
    id: "categories",
    label: "Créer une catégorie personnalisée",
    href: "/settings?tab=categories",
  },
  {
    id: "first-expense",
    label: "Enregistrer votre première dépense",
    href: "/transactions",
  },
  {
    id: "budget",
    label: "Créer votre premier budget",
    href: "/budgets",
  },
  {
    id: "goal",
    label: "Définir un objectif d'épargne",
    href: "/goals",
  },
] as const

interface Props {
  completedSteps: string[]
}

export function OnboardingChecklist({ completedSteps }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const completedSet = new Set(completedSteps)
  const completedCount = STEPS.filter((s) => completedSet.has(s.id)).length
  const progress = Math.round((completedCount / STEPS.length) * 100)
  const firstPendingId = STEPS.find((s) => !completedSet.has(s.id))?.id

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/25 shadow-sm">
      {/* Header — entièrement cliquable */}
      <button
        className="w-full cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={() => setCollapsed((c) => !c)}
        type="button"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-600 px-5 py-4">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold text-sm text-white ring-1 ring-white/20">
              {completedCount}/{STEPS.length}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm leading-tight text-white">
                Démarrage
              </p>
              <p className="mt-0.5 text-blue-100 text-xs">
                {STEPS.length - completedCount > 0
                  ? `${STEPS.length - completedCount} étape${STEPS.length - completedCount > 1 ? "s" : ""} restante${STEPS.length - completedCount > 1 ? "s" : ""}`
                  : "Toutes les étapes complétées !"}
              </p>
            </div>

            <div className="hidden w-24 sm:block">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {collapsed ? (
              <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-white/70" />
            ) : (
              <ChevronUp aria-hidden="true" className="h-4 w-4 shrink-0 text-white/70" />
            )}
          </div>
        </div>

        {!collapsed && (
          <Progress
            className="h-1 rounded-none"
            style={{ "--progress-color": "var(--primary)" } as React.CSSProperties}
            value={progress}
          />
        )}
      </button>

      {/* Liste des étapes */}
      {!collapsed && (
        <div className="bg-card px-3 pb-3 pt-2">
          <ul className="space-y-0.5">
            {STEPS.map((step) => {
              const isCompleted = completedSet.has(step.id)
              const isNext = step.id === firstPendingId

              return (
                <li key={step.id}>
                  <Link
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={step.href}
                    style={
                      isNext
                        ? {
                            background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                            boxShadow: "inset 3px 0 0 color-mix(in oklch, var(--primary) 70%, transparent)",
                          }
                        : undefined
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-[var(--color-income)]"
                      />
                    ) : (
                      <Circle
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                        style={{
                          color: isNext ? "var(--primary)" : "oklch(from var(--foreground) l c h / 0.2)",
                        }}
                      />
                    )}
                    <span
                      className={`flex-1 text-sm leading-snug ${
                        isCompleted
                          ? "text-muted-foreground line-through"
                          : isNext
                            ? "font-medium text-foreground"
                            : "text-foreground/70"
                      }`}
                    >
                      {step.label}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 opacity-30 transition-opacity group-hover:opacity-70"
                      style={isNext ? { color: "var(--primary)" } : undefined}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
