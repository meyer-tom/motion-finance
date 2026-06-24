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

const STEPS = [
  {
    id: "account",
    label: "Créer votre premier compte courant",
    href: "/accounts",
  },
  { id: "savings", label: "Ajouter un compte épargne", href: "/accounts" },
  { id: "profile", label: "Compléter votre profil", href: "/settings" },
  {
    id: "preferences",
    label: "Choisir votre devise",
    href: "/settings?tab=preferences",
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
    id: "recurring",
    label: "Ajouter une transaction récurrente",
    href: "/settings?tab=recurring",
  },
  { id: "budget", label: "Créer votre premier budget", href: "/budgets" },
  { id: "goal", label: "Définir un objectif d'épargne", href: "/goals" },
] as const

function stepTextClass(isCompleted: boolean, isNext: boolean): string {
  if (isCompleted) {
    return "text-muted-foreground line-through"
  }
  if (isNext) {
    return "font-semibold text-foreground"
  }
  return "text-foreground/70"
}

interface Props {
  completedSteps: string[]
}

export function OnboardingChecklist({ completedSteps }: Readonly<Props>) {
  const [collapsed, setCollapsed] = useState(false)

  const completedSet = new Set(completedSteps)
  const completedCount = STEPS.filter((s) => completedSet.has(s.id)).length
  const progress = Math.round((completedCount / STEPS.length) * 100)
  const firstPendingId = STEPS.find((s) => !completedSet.has(s.id))?.id
  const remaining = STEPS.length - completedCount
  const pluralS = remaining > 1 ? "s" : ""
  const remainingLabel =
    remaining > 0
      ? `${remaining} étape${pluralS} restante${pluralS}`
      : "Toutes les étapes complétées !"

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/20 shadow-sm">
      {/* Header — entièrement cliquable */}
      <button
        className="block w-full cursor-pointer select-none bg-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        onClick={() => setCollapsed((c) => !c)}
        type="button"
      >
        <div className="relative overflow-hidden bg-linear-to-br from-primary to-blue-600 px-5 py-5">
          <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-10 -left-4 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            {/* Compteur circulaire */}
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 font-bold text-sm text-white ring-1 ring-white/25">
              {completedCount}/{STEPS.length}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-white leading-tight">
                Démarrage
              </p>
              <p className="mt-0.5 text-blue-100 text-xs">{remainingLabel}</p>
            </div>

            {/* Barre de progression */}
            <div className="hidden w-28 sm:block">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] text-white/60 tabular-nums">
                {progress}%
              </p>
            </div>

            {collapsed ? (
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 text-white/70"
              />
            ) : (
              <ChevronUp
                aria-hidden="true"
                className="size-4 shrink-0 text-white/70"
              />
            )}
          </div>
        </div>

        {/* Barre de progression fine sous le header */}
        {!collapsed && (
          <div className="h-0.5 w-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>

      {/* Liste des étapes */}
      {!collapsed && (
        <div className="bg-card px-3 pt-2 pb-3">
          <ul className="space-y-0.5">
            {STEPS.map((step) => {
              const isCompleted = completedSet.has(step.id)
              const isNext = step.id === firstPendingId

              return (
                <li key={step.id}>
                  <Link
                    className="group flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={step.href}
                    style={
                      isNext
                        ? {
                            background:
                              "color-mix(in oklch, var(--primary) 10%, transparent)",
                          }
                        : undefined
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-5 shrink-0 text-(--color-income)"
                      />
                    ) : (
                      <Circle
                        aria-hidden="true"
                        className="size-5 shrink-0"
                        style={{
                          color: isNext
                            ? "var(--primary)"
                            : "oklch(from var(--foreground) l c h / 0.2)",
                        }}
                      />
                    )}
                    <span
                      className={`flex-1 text-sm leading-snug ${stepTextClass(isCompleted, isNext)}`}
                    >
                      {step.label}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 opacity-30 transition-opacity group-hover:opacity-70"
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
