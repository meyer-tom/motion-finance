"use client"

import { CalendarDays, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const PERIODS = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "quarter", label: "Trimestre" },
  { key: "year", label: "Année" },
] as const

interface Props {
  periodKey: string
}

function firstOfMonthISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
}

function lastOfMonthISO() {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`
}

function isoToDisplay(iso: string): string {
  if (!iso) {
    return ""
  }
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

function parseDisplay(display: string): string | null {
  const digits = display.replace(/\D/g, "")
  if (digits.length !== 8) {
    return null
  }
  const d = Number.parseInt(digits.slice(0, 2), 10)
  const m = Number.parseInt(digits.slice(2, 4), 10)
  const y = Number.parseInt(digits.slice(4, 8), 10)
  const date = new Date(y, m - 1, d)
  if (
    date.getDate() === d &&
    date.getMonth() === m - 1 &&
    date.getFullYear() === y
  ) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  }
  return null
}

interface DateFieldProps {
  id: string
  label: string
  max?: string
  min?: string
  onChange: (iso: string) => void
  value: string
}

function DateField({ id, label, max, min, onChange, value }: DateFieldProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [display, setDisplay] = useState(() => isoToDisplay(value))

  useEffect(() => {
    setDisplay(isoToDisplay(value))
  }, [value])

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    setDisplay(formatted)
    const iso = parseDisplay(formatted)
    if (iso) {
      onChange(iso)
    }
  }

  function handleHiddenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const iso = e.target.value
    if (!iso) {
      return
    }
    setDisplay(isoToDisplay(iso))
    onChange(iso)
  }

  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-muted-foreground text-xs" htmlFor={id}>
        {label}
      </Label>
      <div className="relative">
        <input
          className={cn(
            "h-10 w-full rounded-lg border bg-background px-3 pr-10 text-foreground text-sm",
            "transition-colors placeholder:text-muted-foreground/50 hover:border-muted-foreground/40",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          id={id}
          inputMode="numeric"
          maxLength={10}
          onChange={handleTextChange}
          placeholder="JJ/MM/AAAA"
          value={display}
        />
        {/* Icône + input date invisible en overlay (ouvre le picker natif sur desktop) */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <CalendarDays aria-hidden className="size-4 text-muted-foreground" />
          <input
            aria-label="Ouvrir le calendrier"
            className="absolute inset-0 cursor-pointer opacity-0"
            max={max}
            min={min}
            onChange={handleHiddenChange}
            ref={hiddenRef}
            type="date"
            value={value}
          />
        </div>
      </div>
    </div>
  )
}

export function PeriodSelector({ periodKey }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isCustom = periodKey.startsWith("custom:")
  const [customFrom, setCustomFrom] = useState(() =>
    isCustom ? periodKey.split(":")[1] : firstOfMonthISO()
  )
  const [customTo, setCustomTo] = useState(() =>
    isCustom ? periodKey.split(":")[2] : lastOfMonthISO()
  )
  const [customOpen, setCustomOpen] = useState(false)

  const activeIndex = PERIODS.findIndex((p) => p.key === periodKey)

  const navigate = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (key === "month") {
        params.delete("period")
      } else {
        params.set("period", key)
      }
      router.replace(`/dashboard?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const applyCustom = () => {
    if (!(customFrom && customTo)) {
      return
    }
    navigate(`custom:${customFrom}:${customTo}`)
    setCustomOpen(false)
  }

  const isInvalid = !(customFrom && customTo) || customFrom > customTo

  return (
    <div className="flex flex-1 flex-col gap-2 md:flex-none md:flex-row md:flex-wrap md:items-center">
      {/* Segment control — pleine largeur sur mobile, auto sur desktop */}
      <div className="relative flex w-full rounded-xl border border-border bg-card p-1 md:w-auto">
        {activeIndex >= 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-1 bottom-1 rounded-lg bg-primary/15 transition-all duration-200 ease-in-out"
            style={{
              width: `calc((100% - 8px) / ${PERIODS.length})`,
              left: `calc(4px + ${activeIndex} * (100% - 8px) / ${PERIODS.length})`,
            }}
          />
        )}
        {PERIODS.map(({ key, label }) => (
          <button
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-lg px-4 py-1.5 font-medium text-sm transition-colors duration-150",
              periodKey === key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={key}
            onClick={() => navigate(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bouton période personnalisée — icône seule si pas de période custom sur mobile */}
      <Popover onOpenChange={setCustomOpen} open={customOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border font-medium text-sm transition-all duration-150",
              "px-3 py-1.5",
              isCustom
                ? "w-full border-primary/40 bg-primary/10 text-primary md:w-auto"
                : "w-full bg-muted/40 text-muted-foreground hover:text-foreground md:w-auto"
            )}
            type="button"
          >
            <CalendarDays className="size-3.5 shrink-0" />
            <span>
              {isCustom
                ? `${isoToDisplay(customFrom)} → ${isoToDisplay(customTo)}`
                : "Période personnalisée"}
            </span>
            <ChevronDown className="ml-auto size-3 shrink-0 md:ml-0" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72">
          <div className="space-y-4">
            <p className="font-semibold text-sm">Période personnalisée</p>

            <DateField
              id="custom-from"
              label="Du"
              max={customTo || undefined}
              onChange={setCustomFrom}
              value={customFrom}
            />

            <DateField
              id="custom-to"
              label="Au"
              min={customFrom || undefined}
              onChange={setCustomTo}
              value={customTo}
            />

            <Button
              className="w-full"
              disabled={isInvalid}
              onClick={applyCustom}
              size="sm"
            >
              Appliquer
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
