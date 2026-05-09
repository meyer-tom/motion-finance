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
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="overflow-hidden p-0 shadow-md">
      {/* Header gradient — entièrement cliquable */}
      <button
        className="w-full cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={() => setCollapsed((c) => !c)}
        type="button"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 px-5 py-4">
          {/* Cercles décoratifs */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            {/* Badge compteur */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold text-sm text-white ring-1 ring-white/20">
              {completedCount}/{STEPS.length}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm leading-tight text-white">
                Démarrage
              </p>
              <p className="mt-0.5 text-violet-200 text-xs">
                {STEPS.length - completedCount > 0
                  ? `${STEPS.length - completedCount} étape${STEPS.length - completedCount > 1 ? "s" : ""} restante${STEPS.length - completedCount > 1 ? "s" : ""}`
                  : "Toutes les étapes complétées !"}
              </p>
            </div>

            {/* Mini progress — visible sm+ */}
            <div className="hidden w-24 sm:block">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {collapsed ? (
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-white/70"
              />
            ) : (
              <ChevronUp
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-white/70"
              />
            )}
          </div>
        </div>

        {/* Barre pleine largeur quand déplié */}
        {!collapsed && (
          <Progress
            className="h-1 rounded-none"
            style={
              {
                "--progress-color": "hsl(var(--color-accent))",
              } as React.CSSProperties
            }
            value={progress}
          />
        )}
      </button>

      {/* Liste des étapes */}
      {!collapsed && (
        <CardContent className="px-3 pb-3 pt-2">
          <ul className="space-y-0.5">
            {STEPS.map((step) => {
              const isCompleted = completedSet.has(step.id)
              const isNext = step.id === firstPendingId

              let circleColor: string
              if (isNext) {
                circleColor = "hsl(var(--color-accent))"
              } else {
                circleColor = "hsl(var(--foreground) / 0.2)"
              }

              let labelClass: string
              if (isCompleted) {
                labelClass = "line-through text-muted-foreground"
              } else if (isNext) {
                labelClass = "font-medium text-foreground"
              } else {
                labelClass = "text-foreground/70"
              }

              return (
                <li key={step.id}>
                  <Link
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={step.href}
                    style={
                      isNext
                        ? {
                            background: "hsl(var(--color-accent) / 0.1)",
                            boxShadow: "inset 3px 0 0 hsl(var(--color-accent) / 0.7)",
                          }
                        : undefined
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                        style={{ color: "hsl(var(--color-income))" }}
                      />
                    ) : (
                      <Circle
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                        style={{ color: circleColor }}
                      />
                    )}
                    <span className={`flex-1 text-sm leading-snug ${labelClass}`}>
                      {step.label}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 opacity-30 transition-opacity group-hover:opacity-70"
                      style={isNext ? { color: "hsl(var(--color-accent))" } : undefined}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}
