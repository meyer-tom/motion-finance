"use client"

import { motion } from "framer-motion"
import { Search, SlidersHorizontal, Tag, X } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"

const PILL_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 }

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
  usedTags?: string[]
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
    return `${dateFrom} au ${dateTo}`
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

// ─── Sous-composants ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 font-semibold text-[10px] text-muted-foreground/50 uppercase tracking-[0.12em]">
      {children}
    </p>
  )
}

// ─── Sections de filtres (partagées Sheet + Popover) ─────────────────────────

interface FilterSectionsProps {
  accounts: AccountOption[]
  categories: CategoryOption[]
  onChange: (next: Partial<FiltersValue>) => void
  setTagInput: (v: string) => void
  tagInput: string
  usedTags?: string[]
  value: FiltersValue
}

function FilterSections({
  value,
  onChange,
  accounts,
  categories,
  tagInput,
  setTagInput,
  usedTags,
}: FilterSectionsProps) {
  const isMobile = useIsMobile()

  const currentPreset = DATE_PRESETS.find((p) => {
    const { dateFrom, dateTo } = p.get()
    return value.dateFrom === dateFrom && value.dateTo === dateTo
  })

  function toggleAccount(id: string) {
    const current = value.accountIds
    onChange({
      accountIds: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  }

  function toggleCategory(id: string) {
    const current = value.categoryIds
    onChange({
      categoryIds: current.includes(id)
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

  return (
    <div className="divide-y divide-border/40">
      {/* Période */}
      <div className="px-4 py-4">
        <SectionTitle>Période</SectionTitle>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {DATE_PRESETS.map((preset) => {
            const active = currentPreset?.label === preset.label
            return (
              <button
                className={cn(
                  "rounded-full border px-3 py-1 font-medium text-xs transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-primary/20 shadow-sm"
                    : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                )}
                key={preset.label}
                onClick={() => {
                  const { dateFrom, dateTo } = preset.get()
                  onChange(
                    active ? { dateFrom: "", dateTo: "" } : { dateFrom, dateTo }
                  )
                }}
                type="button"
              >
                {preset.label}
              </button>
            )
          })}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right text-[11px] text-muted-foreground/60">
              De
            </span>
            <Input
              aria-label="Date de début"
              className="h-9 flex-1 rounded-xl border-border/50 bg-muted/40 py-0 text-xs [&::-webkit-datetime-edit-fields-wrapper]:py-0 [&::-webkit-datetime-edit]:py-0"
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              type="date"
              value={value.dateFrom}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right text-[11px] text-muted-foreground/60">
              À
            </span>
            <Input
              aria-label="Date de fin"
              className="h-9 flex-1 rounded-xl border-border/50 bg-muted/40 py-0 text-xs [&::-webkit-datetime-edit-fields-wrapper]:py-0 [&::-webkit-datetime-edit]:py-0"
              onChange={(e) => onChange({ dateTo: e.target.value })}
              type="date"
              value={value.dateTo}
            />
          </div>
        </div>
      </div>

      {/* Montant */}
      <div className="px-4 py-4">
        <SectionTitle>Montant</SectionTitle>
        <div className={isMobile ? "space-y-2" : "flex items-center gap-2"}>
          <div className="relative flex-1">
            <Input
              aria-label="Montant minimum"
              className="h-9 rounded-xl border-border/50 bg-muted/40 pr-6 text-xs"
              min={0}
              onChange={(e) => onChange({ amountMin: e.target.value })}
              placeholder="Min"
              type="number"
              value={value.amountMin}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground/50">
              €
            </span>
          </div>
          {isMobile ? null : (
            <div className="h-px w-3 shrink-0 bg-muted-foreground/30" />
          )}
          <div className="relative flex-1">
            <Input
              aria-label="Montant maximum"
              className="h-9 rounded-xl border-border/50 bg-muted/40 pr-6 text-xs"
              min={0}
              onChange={(e) => onChange({ amountMax: e.target.value })}
              placeholder="Max"
              type="number"
              value={value.amountMax}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground/50">
              €
            </span>
          </div>
        </div>
      </div>

      {/* Comptes */}
      {accounts.length > 0 ? (
        <div className="px-4 py-4">
          <SectionTitle>Comptes</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {accounts.map((acc) => {
              const selected = value.accountIds.includes(acc.id)
              return (
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-xs transition-all",
                    selected
                      ? "shadow-sm"
                      : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                  key={acc.id}
                  onClick={() => toggleAccount(acc.id)}
                  style={
                    selected
                      ? {
                          backgroundColor: `${acc.color}18`,
                          borderColor: `${acc.color}50`,
                          color: acc.color,
                        }
                      : {}
                  }
                  type="button"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: acc.color }}
                  />
                  {acc.name}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Catégories */}
      {categories.length > 0 ? (
        <div className="px-4 py-4">
          <SectionTitle>Catégories</SectionTitle>
          <div className="space-y-3">
            {(["EXPENSE", "INCOME"] as const).map((type) => {
              const group = categories.filter((c) => c.type === type)
              if (group.length === 0) {
                return null
              }
              return (
                <div key={type}>
                  <p className="mb-2 font-semibold text-[10px] text-muted-foreground/35 uppercase tracking-wider">
                    {type === "EXPENSE" ? "Dépenses" : "Revenus"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.map((cat) => {
                      const selected = value.categoryIds.includes(cat.id)
                      return (
                        <button
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-xs transition-all",
                            selected
                              ? "shadow-sm"
                              : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                          )}
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          style={
                            selected
                              ? {
                                  backgroundColor: `${cat.color}18`,
                                  borderColor: `${cat.color}50`,
                                  color: cat.color,
                                }
                              : {}
                          }
                          type="button"
                        >
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Tags */}
      <div className="px-4 py-4">
        <SectionTitle>Tags</SectionTitle>
        {value.tags.length > 0 ? (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {value.tags.map((tag) => (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted px-2.5 py-1 text-xs"
                key={tag}
              >
                <Tag className="size-2.5 text-muted-foreground/60" />
                <span className="font-medium">{tag}</span>
                <button
                  aria-label={`Retirer ${tag}`}
                  className="ml-0.5 text-muted-foreground/60 hover:text-destructive"
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
        {(() => {
          const suggestions = (usedTags ?? []).filter(
            (t) =>
              !value.tags.includes(t) &&
              (!tagInput || t.toLowerCase().includes(tagInput.toLowerCase()))
          )
          return suggestions.length > 0 ? (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {suggestions.map((tag) => (
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-card px-2.5 py-1 font-medium text-muted-foreground text-xs transition-colors hover:border-border hover:text-foreground"
                  key={tag}
                  onClick={() => {
                    onChange({ tags: [...value.tags, tag] })
                    setTagInput("")
                  }}
                  type="button"
                >
                  <Tag className="size-2.5" />
                  {tag}
                </button>
              ))}
            </div>
          ) : null
        })()}
        <Input
          className="h-9 rounded-xl border-border/50 bg-muted/40 text-xs"
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder={
            usedTags?.length ? "Filtrer ou ajouter un tag…" : "Ajouter un tag…"
          }
          value={tagInput}
        />
      </div>
    </div>
  )
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function TransactionFilters({
  value,
  onChange,
  accounts,
  categories,
  activeCount,
  usedTags,
}: TransactionFiltersProps) {
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [localSearch, setLocalSearch] = useState(value.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pillTabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null)
  const activePillIndex = TYPE_OPTIONS.findIndex((o) => o.value === value.type)

  useLayoutEffect(() => {
    if (activePillIndex < 0) return
    const tab = pillTabRefs.current[activePillIndex]
    if (!tab) return
    setPill({ x: tab.offsetLeft, width: tab.offsetWidth })
  }, [activePillIndex])

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

  const sectionsProps: FilterSectionsProps = {
    accounts,
    categories,
    onChange,
    setTagInput,
    tagInput,
    usedTags,
    value,
  }

  const filterBtnClass = cn(
    "flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 font-semibold text-sm transition-colors",
    panelOpen
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border/50 bg-muted/50 text-muted-foreground hover:text-foreground"
  )

  return (
    <div className="space-y-2">
      {/* Barre recherche + bouton filtres */}
      <div className="flex gap-2">
        <div className="relative flex h-11 flex-1 items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 transition-colors focus-within:border-primary/40 focus-within:bg-background">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            aria-label="Rechercher une transaction"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            onChange={handleSearchChange}
            placeholder="Rechercher…"
            value={localSearch}
          />
          {localSearch ? (
            <button
              aria-label="Effacer la recherche"
              className="shrink-0 text-muted-foreground hover:text-foreground"
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

        {/* Sheet sur mobile, Popover sur desktop */}
        {isMobile ? (
          <>
            <button
              aria-expanded={panelOpen}
              aria-haspopup="dialog"
              aria-label="Filtres avancés"
              className={filterBtnClass}
              onClick={() => setPanelOpen(true)}
              type="button"
            >
              <SlidersHorizontal className="size-4" />
              <span>Filtres</span>
              {activeCount > 0 ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
                  {activeCount}
                </span>
              ) : null}
            </button>
            <BottomSheet
              ariaLabel="Filtres avancés"
              noPadding
              onOpenChange={setPanelOpen}
              open={panelOpen}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg tracking-tight">Filtres</h2>
                  {activeCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-bold text-[10px] text-primary-foreground">
                      {activeCount}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  {activeCount > 0 ? (
                    <button
                      className="rounded-full px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                      onClick={clearAll}
                      type="button"
                    >
                      Réinitialiser
                    </button>
                  ) : null}
                  <button
                    aria-label="Fermer les filtres"
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setPanelOpen(false)}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <FilterSections {...sectionsProps} />
            </BottomSheet>
          </>
        ) : (
          <Popover onOpenChange={setPanelOpen} open={panelOpen}>
            <PopoverTrigger asChild>
              <button
                aria-expanded={panelOpen}
                aria-label="Filtres avancés"
                className={filterBtnClass}
                type="button"
              >
                <SlidersHorizontal className="size-4" />
                <span className="hidden sm:inline">Filtres</span>
                {activeCount > 0 ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
                    {activeCount}
                  </span>
                ) : null}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[400px] overflow-hidden rounded-2xl p-0"
              sideOffset={8}
            >
              {/* En-tête du popover */}
              <div className="flex items-center justify-between border-border/40 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Filtres</span>
                  {activeCount > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-bold text-[10px] text-primary-foreground">
                      {activeCount}
                    </span>
                  ) : null}
                </div>
                {activeCount > 0 ? (
                  <button
                    className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                    onClick={clearAll}
                    type="button"
                  >
                    Réinitialiser
                  </button>
                ) : null}
              </div>
              {/* Sections */}
              <div className="max-h-[65vh] overflow-y-auto">
                <FilterSections {...sectionsProps} />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Pills type */}
      <div className="relative flex h-11 items-center rounded-full border border-border/50 bg-muted/50 p-1">
        {pill ? (
          <motion.span
            animate={{ x: pill.x, width: pill.width }}
            aria-hidden
            className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-primary shadow-primary/30 shadow-sm"
            initial={false}
            transition={PILL_SPRING}
          />
        ) : null}
        {TYPE_OPTIONS.map((opt, i) => {
          const active = value.type === opt.value
          return (
            <button
              ref={(el) => {
                pillTabRefs.current[i] = el
              }}
              className={cn(
                "relative z-10 flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 font-semibold text-sm transition-colors duration-150",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={opt.value}
              onClick={() => onChange({ type: opt.value })}
              type="button"
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Chips filtres actifs */}
      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeChips.map((chip) => (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs"
              key={chip.label}
            >
              {chip.label}
              <button
                aria-label={`Retirer ${chip.label}`}
                className="ml-0.5 flex size-3.5 items-center justify-center rounded-full hover:bg-primary/20"
                onClick={chip.onRemove}
                type="button"
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
          <button
            className="flex size-5 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={clearAll}
            title="Effacer tous les filtres"
            type="button"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
