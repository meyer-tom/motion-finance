"use client"

import { RefreshCwIcon } from "lucide-react"
import { useState } from "react"

import { AnimatedAmount } from "@/components/shared/animated-amount"
import { AnimatedProgress } from "@/components/shared/animated-progress"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

/* ── AnimatedAmount ────────────────────────────────────────────────────── */

const AMOUNTS = [
  { label: "Solde total", value: 8420.5, variant: "neutral" as const },
  { label: "Revenus", value: 4500, variant: "income" as const },
  { label: "Dépenses", value: -2700.75, variant: "expense" as const },
  { label: "Virement", value: 500, variant: "transfer" as const },
]

export function DemoAnimatedAmount() {
  const [multiplier, setMultiplier] = useState(1)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>AnimatedAmount</CardTitle>
        <Button
          onClick={() => setMultiplier((m) => (m === 1 ? 1.12 : 1))}
          size="sm"
          variant="outline"
        >
          <RefreshCwIcon />
          Changer valeurs
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {AMOUNTS.map(({ label, value, variant }) => (
          <div className="flex flex-col gap-1" key={label}>
            <span className="text-muted-foreground text-xs">{label}</span>
            <AnimatedAmount
              className="font-bold text-xl"
              currency="EUR"
              value={value * multiplier}
              variant={variant}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/* ── AnimatedProgress ──────────────────────────────────────────────────── */

const BUDGETS = [
  { label: "Loisirs — 34%", value: 34 },
  { label: "Transport — 62%", value: 62 },
  { label: "Alimentation — 87%", value: 87 },
  { label: "Logement — 95%", value: 95 },
]

const VARIANTS = [
  { label: "green (variant forcé)", value: 70, variant: "green" as const },
  { label: "orange (variant forcé)", value: 70, variant: "orange" as const },
  { label: "red (variant forcé)", value: 70, variant: "red" as const },
  { label: "accent (variant forcé)", value: 70, variant: "accent" as const },
]

export function DemoAnimatedProgress() {
  return (
    <div className="flex flex-col gap-4">
      {/* Couleur auto budget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Couleur auto (mode budget)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {BUDGETS.map(({ label, value }) => (
            <div className="flex flex-col gap-1.5" key={label}>
              <span className="text-muted-foreground text-xs">{label}</span>
              <AnimatedProgress value={value} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Variants forcés */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Variants explicites</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {VARIANTS.map(({ label, value, variant }) => (
            <div className="flex flex-col gap-1.5" key={label}>
              <span className="text-muted-foreground text-xs">{label}</span>
              <AnimatedProgress value={value} variant={variant} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

/* ── BottomSheet ───────────────────────────────────────────────────────── */

export function DemoBottomSheet() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Ouvrir BottomSheet
      </Button>

      <BottomSheet
        description="Ajoutez rapidement une dépense ou un revenu."
        onOpenChange={setOpen}
        open={open}
        title="Nouvelle transaction"
      >
        <div className="flex flex-col gap-3 px-6 pb-2">
          <Input placeholder="Description" />
          <Input placeholder="Montant (€)" type="number" />
          <Button className="w-full" onClick={() => setOpen(false)}>
            Enregistrer
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
