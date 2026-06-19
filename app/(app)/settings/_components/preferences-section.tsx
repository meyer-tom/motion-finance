"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateCurrency } from "@/lib/actions/settings"
import { useCurrency } from "@/lib/context/currency-context"
import { toast } from "@/lib/toast"
import {
  type UpdateCurrencyInput,
  updateCurrencySchema,
} from "@/lib/validations/settings"

const CURRENCIES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "USD", label: "Dollar américain ($)" },
  { code: "GBP", label: "Livre sterling (£)" },
  { code: "CHF", label: "Franc suisse (CHF)" },
  { code: "CAD", label: "Dollar canadien (CA$)" },
  { code: "JPY", label: "Yen japonais (¥)" },
] as const

const THEMES = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Automatique", icon: Monitor },
] as const

export function PreferencesSection({
  initialCurrency,
}: {
  initialCurrency: string
}) {
  const { currency, setCurrency } = useCurrency()
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  const { handleSubmit, setValue, watch } = useForm<UpdateCurrencyInput>({
    resolver: standardSchemaResolver(updateCurrencySchema),
    defaultValues: { currency: initialCurrency },
  })

  const selectedCurrency = watch("currency")

  function onSubmit(data: UpdateCurrencyInput) {
    startTransition(async () => {
      try {
        await updateCurrency(data)
        setCurrency(data.currency)
        toast.success("Devise mise à jour")
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Une erreur est survenue"
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Devise */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-border/60 border-b px-6 py-5">
          <h2 className="font-semibold text-base">Devise</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Devise utilisée pour l'affichage de tous les montants
          </p>
        </div>
        <div className="px-6 py-6">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                onValueChange={(v) => setValue("currency", v)}
                value={selectedCurrency}
              >
                <SelectTrigger className="w-full sm:w-64" id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={isPending || selectedCurrency === currency}
              type="submit"
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </div>
      </div>

      {/* Thème */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-border/60 border-b px-6 py-5">
          <h2 className="font-semibold text-base">Thème</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Apparence de l'interface
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="flex gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <Button
                className="flex-1 gap-2"
                key={value}
                onClick={() => setTheme(value)}
                type="button"
                variant={theme === value ? "default" : "outline"}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
