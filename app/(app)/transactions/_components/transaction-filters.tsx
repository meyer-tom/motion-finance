"use client"

import { Search, SlidersHorizontal, Tag, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface AccountOption {
  color: string
  id: string
  name: string
}

export interface CategoryOption {
  color: string
  icon: string
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
}

export interface FiltersValue {
  accountIds: string[]
  amountMax: string
  amountMin: string
  categoryIds: string[]
  dateFrom: string
  dateTo: string
  search: string
  tags: string[]
  type: "" | "EXPENSE" | "INCOME" | "TRANSFER"
}

interface TransactionFiltersProps {
  accounts: AccountOption[]
  activeCount: number
  categories: CategoryOption[]
  onChange: (next: Partial<FiltersValue>) => void
  value: FiltersValue
}

const TYPE_OPTIONS = [
  { value: "" as const, label: "Tous" },
  { value: "EXPENSE" as const, label: "Dépenses" },
  { value: "INCOME" as const, label: "Revenus" },
  { value: "TRANSFER" as const, label: "Virements" },
]

const DATE_PRESETS = [
  {
    label: "Aujourd'hui",
    get(): { dateFrom: string; dateTo: string } {
      const d = new Date().toISOString().slice(0, 10)
      return { dateFrom: d, dateTo: d }
    },
  },
  {
    label: "7 jours",
    get(): { dateFrom: string; dateTo: string } {
      const now = new Date()
      const from = new Date(now)
      from.setDate(from.getDate() - 7)
      return {
        dateFrom: from.toISOString().slice(0, 10),
        dateTo: now.toISOString().slice(0, 10),
      }
    },
  },
  {
    label: "Ce mois",
    get(): { dateFrom: string; dateTo: string } {
      const now = new Date()
      return {
        dateFrom: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        dateTo: now.toISOString().slice(0, 10),
      }
    },
  },
  {
    label: "3 mois",
    get(): { dateFrom: string; dateTo: string } {
      const now = new Date()
      const from = new Date(now)
      from.setMonth(from.getMonth() - 3)
      return {
        dateFrom: from.toISOString().slice(0, 10),
        dateTo: now.toISOString().slice(0, 10),
      }
    },
  },
  {
    label: "Cette année",
    get(): { dateFrom: string; dateTo: string } {
      const now = new Date()
      return {
        dateFrom: `${now.getFullYear()}-01-01`,
        dateTo: now.toISOString().slice(0, 10),
      }
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDateLabel(dateFrom: string, dateTo: string): string {
  if (dateFrom && dateTo && dateFrom === dateTo) {
    return dateFrom
  }
  if (dateFrom && dateTo) {
    return `${dateFrom} → ${dateTo}`
  }
  return dateFrom || dateTo
}

function buildActiveChips(
  value: FiltersValue,
  accounts: AccountOption[],
  categories: CategoryOption[],
  onChange: (next: Partial<FiltersValue>) => void
): { label: string; onRemove: () => void }[] {
  const chips: { label: string; onRemove: () => void }[] = []

  if (value.type) {
    const label =
      TYPE_OPTIONS.find((o) => o.value === value.type)?.label ?? value.type
    chips.push({ label, onRemove: () => onChange({ type: "" }) })
  }
  if (value.dateFrom || value.dateTo) {
    chips.push({
      label: buildDateLabel(value.dateFrom, value.dateTo),
      onRemove: () => onChange({ dateFrom: "", dateTo: "" }),
    })
  }
  for (const id of value.accountIds) {
    const acc = accounts.find((a) => a.id === id)
    if (acc) {
      chips.push({
        label: acc.name,
        onRemove: () =>
          onChange({ accountIds: value.accountIds.filter((x) => x !== id) }),
      })
    }
  }
  for (const id of value.categoryIds) {
    const cat = categories.find((c) => c.id === id)
    if (cat) {
      chips.push({
        label: cat.name,
        onRemove: () =>
          onChange({
            categoryIds: value.categoryIds.filter((x) => x !== id),
          }),
      })
    }
  }
  if (value.amountMin || value.amountMax) {
    chips.push({
      label: `${value.amountMin || "0"} – ${value.amountMax || "∞"} €`,
      onRemove: () => onChange({ amountMin: "", amountMax: "" }),
    })
  }
  for (const tag of value.tags) {
    chips.push({
      label: `#${tag}`,
      onRemove: () => onChange({ tags: value.tags.filter((t) => t !== tag) }),
    })
  }
  return chips
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-medium text-[11px] text-muted-foreground/70 uppercase tracking-widest">
      {children}
    </p>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function TransactionFilters({
  value,
  onChange,
  accounts,
  categories,
  activeCount,
}: TransactionFiltersProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [localSearch, setLocalSearch] = useState(value.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setLocalSearch(value.search)
  }, [value.search])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setLocalSearch(v)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => onChange({ search: v }), 300)
    },
    [onChange]
  )

  function toggleId(field: "accountIds" | "categoryIds", id: string) {
    const current = value[field]
    onChange({
      [field]: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim()
      if (!value.tags.includes(tag)) {
        onChange({ tags: [...value.tags, tag] })
      }
      setTagInput("")
    }
  }

  function clearAll() {
    onChange({
      type: "",
      accountIds: [],
      categoryIds: [],
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      tags: [],
      search: "",
    })
    setLocalSearch("")
  }

  const activeChips = buildActiveChips(value, accounts, categories, onChange)

  const currentPreset = DATE_PRESETS.find((p) => {
    const { dateFrom, dateTo } = p.get()
    return value.dateFrom === dateFrom && value.dateTo === dateTo
  })

  return (
    <div className="space-y-2">
      {/* Barre recherche + bouton filtres */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Rechercher une transaction"
            className="pl-9"
            onChange={handleSearchChange}
            placeholder="Rechercher…"
            value={localSearch}
          />
          {localSearch ? (
            <button
              aria-label="Effacer la recherche"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setLocalSearch("")
                onChange({ search: "" })
              }}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <Popover onOpenChange={setPopoverOpen} open={popoverOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={popoverOpen}
              aria-label="Filtres avancés"
              className={cn(
                "relative shrink-0 gap-2",
                popoverOpen && "border-primary"
              )}
              size="default"
              variant="outline"
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filtres</span>
              {activeCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
                  {activeCount}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-[min(520px,calc(100vw-1rem))] p-0"
            sideOffset={8}
          >
            {/* Contenu : 2 colonnes sur sm, 1 colonne sinon */}
            <div className="grid divide-border/60 sm:grid-cols-2 sm:divide-x">
              {/* Colonne gauche */}
              <div className="min-w-0 space-y-5 p-4">
                {/* Période */}
                <div>
                  <SectionLabel>Période</SectionLabel>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map((preset) => {
                      const active = currentPreset?.label === preset.label
                      return (
                        <button
                          className={cn(
                            "rounded-md border px-2.5 py-1 font-medium text-xs transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          key={preset.label}
                          onClick={() => {
                            const { dateFrom, dateTo } = preset.get()
                            onChange(
                              active
                                ? { dateFrom: "", dateTo: "" }
                                : { dateFrom, dateTo }
                            )
                          }}
                          type="button"
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-[11px] text-muted-foreground">
                        De
                      </span>
                      <Input
                        aria-label="Date de début"
                        className="h-8 flex-1 text-xs"
                        onChange={(e) => onChange({ dateFrom: e.target.value })}
                        type="date"
                        value={value.dateFrom}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-[11px] text-muted-foreground">
                        À
                      </span>
                      <Input
                        aria-label="Date de fin"
                        className="h-8 flex-1 text-xs"
                        onChange={(e) => onChange({ dateTo: e.target.value })}
                        type="date"
                        value={value.dateTo}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Montant */}
                <div>
                  <SectionLabel>Montant (€)</SectionLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label="Montant minimum"
                      className="h-8 text-xs"
                      min={0}
                      onChange={(e) => onChange({ amountMin: e.target.value })}
                      placeholder="Min"
                      type="number"
                      value={value.amountMin}
                    />
                    <span className="shrink-0 text-muted-foreground text-xs">
                      –
                    </span>
                    <Input
                      aria-label="Montant maximum"
                      className="h-8 text-xs"
                      min={0}
                      onChange={(e) => onChange({ amountMax: e.target.value })}
                      placeholder="Max"
                      type="number"
                      value={value.amountMax}
                    />
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Tags */}
                <div>
                  <SectionLabel>Tags</SectionLabel>
                  {value.tags.length > 0 ? (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {value.tags.map((tag) => (
                        <span
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-xs"
                          key={tag}
                        >
                          <Tag className="size-2.5 text-muted-foreground" />
                          {tag}
                          <button
                            aria-label={`Retirer ${tag}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              onChange({
                                tags: value.tags.filter((t) => t !== tag),
                              })
                            }
                            type="button"
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <Input
                    className="h-8 text-xs"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Ajouter un tag…"
                    value={tagInput}
                  />
                </div>
              </div>

              {/* Colonne droite */}
              <div className="min-w-0 space-y-5 p-4">
                {accounts.length > 0 ? (
                  <div>
                    <SectionLabel>Comptes</SectionLabel>
                    <div className="space-y-2">
                      {accounts.map((acc) => (
                        <label
                          className="flex cursor-pointer items-center gap-2.5"
                          htmlFor={`acc-${acc.id}`}
                          key={acc.id}
                        >
                          <Checkbox
                            checked={value.accountIds.includes(acc.id)}
                            id={`acc-${acc.id}`}
                            onCheckedChange={() =>
                              toggleId("accountIds", acc.id)
                            }
                          />
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: acc.color }}
                          />
                          <span className="truncate text-sm">{acc.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {accounts.length > 0 && categories.length > 0 ? (
                  <div className="h-px bg-border/60" />
                ) : null}

                {categories.length > 0 ? (
                  <div>
                    <SectionLabel>Catégories</SectionLabel>
                    <div className="max-h-52 space-y-4 overflow-y-auto pr-1">
                      {(["EXPENSE", "INCOME"] as const).map((type) => {
                        const group = categories.filter((c) => c.type === type)
                        if (group.length === 0) {
                          return null
                        }
                        return (
                          <div key={type}>
                            <p className="mb-1.5 font-medium text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                              {type === "EXPENSE" ? "Dépenses" : "Revenus"}
                            </p>
                            <div className="space-y-2">
                              {group.map((cat) => (
                                <label
                                  className="flex cursor-pointer items-center gap-2.5"
                                  htmlFor={`cat-${cat.id}`}
                                  key={cat.id}
                                >
                                  <Checkbox
                                    checked={value.categoryIds.includes(cat.id)}
                                    id={`cat-${cat.id}`}
                                    onCheckedChange={() =>
                                      toggleId("categoryIds", cat.id)
                                    }
                                  />
                                  <span
                                    className="size-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  <span className="truncate text-sm">
                                    {cat.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-border/60 border-t px-4 py-3">
              <button
                className="text-muted-foreground text-xs hover:text-foreground"
                onClick={clearAll}
                type="button"
              >
                Tout effacer
              </button>
              <Button
                className="h-7 px-3 text-xs"
                onClick={() => setPopoverOpen(false)}
                size="sm"
              >
                Fermer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Pills type */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TYPE_OPTIONS.map((opt) => (
          <button
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 font-medium text-xs transition-colors",
              value.type === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            key={opt.value}
            onClick={() => onChange({ type: opt.value })}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chips filtres actifs */}
      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <Badge
              className="gap-1 pr-1 font-normal"
              key={chip.label}
              variant="secondary"
            >
              {chip.label}
              <button
                aria-label={`Retirer ${chip.label}`}
                className="ml-0.5 hover:text-destructive"
                onClick={chip.onRemove}
                type="button"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={clearAll}
            type="button"
          >
            Tout effacer
          </button>
        </div>
      ) : null}
    </div>
  )
}
