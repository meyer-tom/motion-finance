"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRightLeft, Calendar, Minus, Plus, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { type Resolver, useForm, useWatch } from "react-hook-form"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import {
  type RecurringSuggestionItem,
  RecurringSuggestions,
} from "@/components/transactions/recurring-suggestions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSuggestedRecurring } from "@/lib/actions/recurring-transactions"
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/actions/transactions"
import { useTransactionForm } from "@/lib/context/transaction-form-context"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"
import {
  type TransactionInput,
  transactionSchema,
} from "@/lib/validations/transaction"

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface AccountOption {
  balance: number
  color: string
  icon: string
  id: string
  name: string
  type: "CHECKING" | "SAVINGS"
}

export interface CategoryOption {
  color: string
  icon: string
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
}

interface TransactionFormSheetProps {
  accounts: AccountOption[]
  categories: CategoryOption[]
  usedTags: string[]
}

/* ── Constantes ────────────────────────────────────────────────────────────── */

const TRANSACTION_TYPES = [
  {
    value: "EXPENSE" as const,
    label: "Dépense",
    icon: Minus,
    color: "var(--color-expense)",
  },
  {
    value: "INCOME" as const,
    label: "Revenu",
    icon: Plus,
    color: "var(--color-income)",
  },
  {
    value: "TRANSFER" as const,
    label: "Virement",
    icon: ArrowRightLeft,
    color: "var(--color-transfer)",
  },
]

// Hoissé au niveau module pour éviter la recréation à chaque appel
const TRAILING_COMMA_RE = /,$/

/** Convertit "YYYY-MM-DD" en Date locale (sans décalage UTC). */
function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Formate une Date en "YYYY-MM-DD" pour input type="date". */
function formatDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getSubmitLabel(isPending: boolean, isEdit: boolean) {
  if (isPending) {
    return "Enregistrement…"
  }
  if (isEdit) {
    return "Enregistrer la transaction"
  }
  return "Ajouter la transaction"
}

type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER"

function TypeSegmentedControl({
  selectedType,
  activeTypeColor,
  typeIndex,
  onTypeChange,
}: {
  selectedType: TransactionType
  activeTypeColor: string
  typeIndex: number
  onTypeChange: (value: TransactionType) => void
}) {
  return (
    <div className="relative flex rounded-xl bg-muted p-1">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-lg bg-background shadow-sm transition-all duration-200"
        style={{
          width: "calc((100% - 8px) / 3)",
          left: `calc(4px + ${typeIndex} * (100% - 8px) / 3)`,
        }}
      />
      {TRANSACTION_TYPES.map(({ value, label, icon: Icon }) => (
        <button
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-medium text-sm transition-colors",
            selectedType === value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          )}
          key={value}
          onClick={() => onTypeChange(value)}
          style={selectedType === value ? { color: activeTypeColor } : {}}
          type="button"
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Sous-composants ────────────────────────────────────────────────────────── */

function AccountSelects({
  accounts,
  selectedType,
  defaultAccountId,
  defaultToAccountId,
  selectedAccountId,
  onAccountChange,
  onToAccountChange,
  accountError,
  toAccountError,
}: {
  accounts: AccountOption[]
  selectedType: TransactionType
  defaultAccountId: string
  defaultToAccountId?: string
  selectedAccountId: string
  onAccountChange: (v: string) => void
  onToAccountChange: (v: string) => void
  accountError?: string
  toAccountError?: string
}) {
  const availableToAccounts = accounts.filter((a) => a.id !== selectedAccountId)
  const label = selectedType === "TRANSFER" ? "Compte source" : "Compte"

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-account">{label}</Label>
        <Select
          defaultValue={defaultAccountId || undefined}
          onValueChange={onAccountChange}
        >
          <SelectTrigger id="tx-account">
            <SelectValue placeholder="Sélectionner un compte" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  {account.name}
                  <span
                    className={cn(
                      "ml-1 rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                      account.type === "CHECKING"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    )}
                  >
                    {account.type === "CHECKING" ? "Courant" : "Épargne"}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {accountError ? (
          <p className="text-destructive text-xs">{accountError}</p>
        ) : null}
      </div>

      {selectedType === "TRANSFER" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-to-account">Compte destination</Label>
          <Select
            defaultValue={defaultToAccountId || undefined}
            onValueChange={onToAccountChange}
          >
            <SelectTrigger id="tx-to-account">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {availableToAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    {account.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {toAccountError ? (
            <p className="text-destructive text-xs">{toAccountError}</p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

function CategoryGrid({
  categories,
  selectedCategoryId,
  onSelect,
  error,
  cols = 4,
  scrollable = false,
}: {
  categories: CategoryOption[]
  selectedCategoryId: string | null | undefined
  onSelect: (id: string | null) => void
  error?: string
  cols?: 4 | 5 | 6
  scrollable?: boolean
}) {
  let colsClass = "grid-cols-4"
  if (cols === 5) colsClass = "grid-cols-5"
  if (cols === 6) colsClass = "grid-cols-6"

  const items = categories.map((cat) => {
    const Icon = getCategoryIcon(cat.icon)
    const isSelected = selectedCategoryId === cat.id
    return (
      <button
        className={cn(
          "flex flex-col items-center gap-1 rounded-xl border p-2 transition-all",
          scrollable && "w-[68px] shrink-0",
          isSelected
            ? "border-transparent shadow-sm"
            : "border-border hover:border-border/80 hover:bg-muted/50"
        )}
        key={cat.id}
        onClick={() => onSelect(isSelected ? null : cat.id)}
        style={
          isSelected
            ? { backgroundColor: `${cat.color}18`, borderColor: `${cat.color}40` }
            : {}
        }
        type="button"
      >
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: isSelected ? `${cat.color}20` : "transparent" }}
        >
          <Icon
            className="size-4"
            style={{ color: isSelected ? cat.color : undefined }}
          />
        </div>
        <span
          className="w-full truncate text-center text-[10px] leading-tight"
          style={{ color: isSelected ? cat.color : undefined }}
        >
          {cat.name}
        </span>
      </button>
    )
  })

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Catégorie</Label>
      {scrollable ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [touch-action:pan-x] overscroll-x-contain">
          {items}
        </div>
      ) : (
        <div className={`grid ${colsClass} gap-2`}>{items}</div>
      )}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}

function TagsInput({
  tags,
  onTagsChange,
  suggestions = [],
  error,
}: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  suggestions?: string[]
  error?: string
}) {
  const [tagInput, setTagInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !tags.includes(s) &&
      (tagInput === "" || s.toLowerCase().includes(tagInput.toLowerCase()))
  )

  function addTag(value?: string) {
    const trimmed = (value ?? tagInput).trim().replace(TRAILING_COMMA_RE, "")
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      onTagsChange([...tags, trimmed])
    }
    setTagInput("")
    inputRef.current?.focus()
  }

  function removeTag(tag: string) {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && tagInput === "") {
      onTagsChange(tags.slice(0, -1))
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <Label htmlFor="tx-tags">
        Tags{" "}
        <span className="font-normal text-muted-foreground">(optionnel)</span>
      </Label>
      <div className="relative">
        {/* label[htmlFor] permet de cliquer n'importe où dans le conteneur pour focus l'input */}
        <label
          className="flex min-h-10 cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring/50"
          htmlFor="tx-tags"
        >
          {tags.map((tag) => (
            <Badge className="gap-1 text-xs" key={tag} variant="outline">
              {tag}
              <button
                aria-label={`Supprimer le tag ${tag}`}
                className="ml-0.5 rounded-full hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault()
                  removeTag(tag)
                }}
                type="button"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <input
            className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            id="tx-tags"
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(e) => {
              setTagInput(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              tags.length === 0 ? "Entrée ou virgule pour ajouter…" : ""
            }
            ref={inputRef}
            value={tagInput}
          />
        </label>

        {/* Dropdown suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 ? (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            <div className="flex flex-wrap gap-1.5 p-2">
              {filteredSuggestions.map((s) => (
                <button
                  className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                  key={s}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addTag(s)
                  }}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}


function DateInput({
  initialDate,
  onChange,
  error,
}: {
  initialDate: Date
  onChange: (isoDate: string) => void
  error?: string
}) {
  function toDisplay(d: Date) {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  const [display, setDisplay] = useState(() => toDisplay(initialDate))
  const [isoValue, setIsoValue] = useState(() => formatDateInput(initialDate))
  const hiddenRef = useRef<HTMLInputElement>(null)

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    setDisplay(formatted)

    if (digits.length === 8) {
      const d = parseInt(digits.slice(0, 2), 10)
      const m = parseInt(digits.slice(2, 4), 10)
      const y = parseInt(digits.slice(4, 8), 10)
      const date = new Date(y, m - 1, d)
      if (date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y) {
        const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        setIsoValue(iso)
        onChange(iso)
      }
    }
  }

  function handleHiddenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const iso = e.target.value
    if (!iso) return
    const [y, m, d] = iso.split("-").map(Number)
    setDisplay(`${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`)
    setIsoValue(iso)
    onChange(iso)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="tx-date">Date</Label>
      <div className="relative">
        <Input
          id="tx-date"
          inputMode="numeric"
          maxLength={10}
          onChange={handleTextChange}
          placeholder="JJ/MM/AAAA"
          value={display}
        />
        {/* Bouton calendrier avec input date invisible superposé — showPicker() non supporté iOS */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <Calendar aria-hidden className="size-4 text-muted-foreground" />
          <input
            aria-label="Ouvrir le calendrier"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleHiddenChange}
            ref={hiddenRef}
            type="date"
            value={isoValue}
          />
        </div>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}

function AmountDateRow({
  wide,
  amountDisplay,
  onAmountChange,
  amountError,
  initialDate,
  onDateChange,
  dateError,
}: {
  wide: boolean
  amountDisplay: string
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  amountError?: string
  initialDate: Date
  onDateChange: (isoDate: string) => void
  dateError?: string
}) {
  return (
    <div className={wide ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-amount">Montant (€)</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
          <Input
            className="pl-7 font-semibold"
            id="tx-amount"
            inputMode="decimal"
            onChange={onAmountChange}
            placeholder="0,00"
            type="text"
            value={amountDisplay}
          />
        </div>
        {amountError ? (
          <p className="text-destructive text-xs">{amountError}</p>
        ) : null}
      </div>

      <DateInput
        error={dateError}
        initialDate={initialDate}
        onChange={onDateChange}
      />
    </div>
  )
}

/* ── Form body ─────────────────────────────────────────────────────────────── */

function TransactionFormBody({
  accounts,
  categories,
  usedTags,
  onSuccess,
  wide = false,
}: {
  accounts: AccountOption[]
  categories: CategoryOption[]
  usedTags: string[]
  onSuccess: () => void
  wide?: boolean
}) {
  const { initialValues, closeForm } = useTransactionForm()
  const queryClient = useQueryClient()
  const isEdit = Boolean(initialValues?.id)

  const defaultAccountId =
    initialValues?.accountId ??
    (accounts.find((a) => a.type === "CHECKING")?.id ?? accounts[0]?.id ?? "")

  const {
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<TransactionInput>({
    // Cast nécessaire : standardSchemaResolver infère date: unknown avec z.coerce.date() en Zod v4
    resolver: standardSchemaResolver(
      transactionSchema
    ) as Resolver<TransactionInput>,
    mode: "onChange",
    defaultValues: {
      type: initialValues?.type ?? "EXPENSE",
      title: initialValues?.title ?? "",
      amount: initialValues?.amount,
      date: initialValues?.date ?? new Date(),
      accountId: defaultAccountId,
      categoryId: initialValues?.categoryId ?? null,
      toAccountId: initialValues?.toAccountId ?? null,
      description: initialValues?.description ?? "",
      tags: initialValues?.tags ?? [],
    },
  })

  const selectedType = useWatch({ control, name: "type" })
  const selectedTitle = useWatch({ control, name: "title" })
  const selectedDescription = useWatch({ control, name: "description" })
  const selectedCategoryId = useWatch({ control, name: "categoryId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const currentTags = useWatch({ control, name: "tags" }) ?? []

  const [amountDisplay, setAmountDisplay] = useState(
    initialValues?.amount == null ? "" : String(initialValues.amount)
  )

  const { data: suggestions = [], isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ["recurring-suggestions"],
    queryFn: () => getSuggestedRecurring(),
    staleTime: 5 * 60 * 1000,
  })

  const [isPending, startTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function handleDelete() {
    const id = initialValues?.id
    if (!id) return
    startDeleteTransition(async () => {
      await deleteTransaction(id)
      closeForm()
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      window.dispatchEvent(new CustomEvent("transaction:mutated"))
    })
  }

  function handleApplySuggestion(s: RecurringSuggestionItem) {
    setValue("type", s.type, { shouldValidate: true })
    setValue("title", s.name, { shouldValidate: true })
    setValue("amount", s.amount, { shouldValidate: true })
    setAmountDisplay(String(s.amount))
    setValue("accountId", s.accountId, { shouldValidate: true })
    setValue("categoryId", s.categoryId ?? null, { shouldValidate: true })
    setValue(
      "toAccountId",
      s.type === "TRANSFER" ? (s.toAccountId ?? null) : null
    )
    setValue("description", s.description ?? "", { shouldValidate: true })
  }

  // Reset quand initialValues change (réouverture du formulaire)
  useEffect(() => {
    const newAccountId =
      initialValues?.accountId ??
      (accounts.find((a) => a.type === "CHECKING")?.id ?? accounts[0]?.id ?? "")

    reset({
      type: initialValues?.type ?? "EXPENSE",
      title: initialValues?.title ?? "",
      amount: initialValues?.amount,
      date: initialValues?.date ?? new Date(),
      accountId: newAccountId,
      categoryId: initialValues?.categoryId ?? null,
      toAccountId: initialValues?.toAccountId ?? null,
      description: initialValues?.description ?? "",
      tags: initialValues?.tags ?? [],
    })
    setAmountDisplay(
      initialValues?.amount == null ? "" : String(initialValues.amount)
    )
  }, [initialValues, reset, accounts])

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(",", ".")
    setAmountDisplay(raw)
    const num = Number.parseFloat(raw)
    setValue(
      "amount",
      Number.isNaN(num) ? (undefined as unknown as number) : num,
      { shouldValidate: true }
    )
  }

  function onSubmit(data: TransactionInput) {
    startTransition(async () => {
      try {
        if (isEdit && initialValues?.id) {
          await updateTransaction(initialValues.id, data)
        } else {
          await createTransaction(data)
        }
        onSuccess()
      } catch (err) {
        setError("root", {
          message:
            err instanceof Error ? err.message : "Une erreur est survenue",
        })
      }
    })
  }

  /* ── Données dérivées ─────────────────────────────────────────────────── */

  const filteredCategories = categories.filter(
    (c) => c.type === (selectedType === "EXPENSE" ? "EXPENSE" : "INCOME")
  )

  const typeIndex = TRANSACTION_TYPES.findIndex((t) => t.value === selectedType)
  const activeTypeColor =
    TRANSACTION_TYPES[typeIndex]?.color ?? "var(--color-expense)"

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      {/* ── Segmented control type ── */}
      <TypeSegmentedControl
        activeTypeColor={activeTypeColor}
        onTypeChange={(value) => {
          setValue("type", value, { shouldValidate: true })
          setValue("categoryId", null)
          setValue("toAccountId", null)
        }}
        selectedType={selectedType}
        typeIndex={typeIndex}
      />

      {/* ── Suggestions récurrentes ── */}
      {isEdit ? null : (
        <RecurringSuggestions
          isLoading={isSuggestionsLoading}
          onApply={handleApplySuggestion}
          suggestions={suggestions}
        />
      )}

      {/* ── Titre + Compte source (même ligne sur sm+) ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-title">Titre</Label>
          <Input
            id="tx-title"
            onChange={(e) =>
              setValue("title", e.target.value, { shouldValidate: true })
            }
            placeholder="Ex : Courses"
            value={selectedTitle ?? ""}
          />
          {errors.title ? (
            <p className="text-destructive text-xs">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-account">
            {selectedType === "TRANSFER" ? "Compte source" : "Compte"}
          </Label>
          <Select
            onValueChange={(v) =>
              setValue("accountId", v, { shouldValidate: true })
            }
            value={selectedAccountId || undefined}
          >
            <SelectTrigger id="tx-account">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    {account.name}
                    <span
                      className={cn(
                        "ml-1 rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                        account.type === "CHECKING"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {account.type === "CHECKING" ? "Courant" : "Épargne"}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountId ? (
            <p className="text-destructive text-xs">
              {errors.accountId.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* ── Montant + Date ── */}
      <AmountDateRow
        amountDisplay={amountDisplay}
        amountError={errors.amount?.message}
        dateError={errors.date?.message}
        initialDate={
          initialValues?.date instanceof Date ? initialValues.date : new Date()
        }
        onAmountChange={handleAmountChange}
        onDateChange={(isoDate) => {
          setValue("date", parseLocalDate(isoDate), { shouldValidate: true })
        }}
        wide={wide}
      />

      {/* ── Compte destination (virements uniquement) ── */}
      {selectedType === "TRANSFER" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-to-account">Compte destination</Label>
          <Select
            defaultValue={initialValues?.toAccountId ?? undefined}
            onValueChange={(v) =>
              setValue("toAccountId", v, { shouldValidate: true })
            }
          >
            <SelectTrigger id="tx-to-account">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {accounts
                .filter((a) => a.id !== selectedAccountId)
                .map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                      {account.name}
                      <span
                        className={cn(
                          "ml-1 rounded-full px-1.5 py-0.5 font-medium text-[10px]",
                          account.type === "CHECKING"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {account.type === "CHECKING" ? "Courant" : "Épargne"}
                      </span>
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.toAccountId ? (
            <p className="text-destructive text-xs">
              {errors.toAccountId.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* ── Grille de catégories (hors TRANSFER) ── */}
      {selectedType === "TRANSFER" ? null : (
        <CategoryGrid
          categories={filteredCategories}
          cols={wide ? 6 : 4}
          error={errors.categoryId?.message}
          onSelect={(id) =>
            setValue("categoryId", id, { shouldValidate: true })
          }
          scrollable={!wide}
          selectedCategoryId={selectedCategoryId}
        />
      )}

      {/* ── Note (optionnel) ── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-description">
          Note{" "}
          <span className="font-normal text-muted-foreground">(optionnel)</span>
        </Label>
        <Input
          id="tx-description"
          value={selectedDescription ?? ""}
          onChange={(e) =>
            setValue("description", e.target.value, { shouldValidate: true })
          }
          placeholder="Informations complémentaires…"
        />
        {errors.description ? (
          <p className="text-destructive text-xs">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      {/* ── Tags ── */}
      <TagsInput
        error={errors.tags?.message}
        onTagsChange={(t) => setValue("tags", t, { shouldValidate: true })}
        suggestions={usedTags}
        tags={currentTags}
      />

      {/* ── Erreur globale ── */}
      {errors.root ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {errors.root.message}
        </p>
      ) : null}

      {/* ── Submit ── */}
      <Button
        className="mt-1 w-full"
        disabled={isPending}
        style={{
          backgroundColor: activeTypeColor,
          borderColor: activeTypeColor,
        }}
        type="submit"
      >
        {getSubmitLabel(isPending, isEdit)}
      </Button>

      {/* ── Supprimer (édition uniquement) ── */}
      {isEdit ? (
        deleteConfirm ? (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={isDeletePending}
              onClick={handleDelete}
              type="button"
              variant="destructive"
            >
              {isDeletePending ? "Suppression…" : "Confirmer"}
            </Button>
            <Button
              onClick={() => setDeleteConfirm(false)}
              type="button"
              variant="ghost"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <Button
            className="w-full text-destructive hover:text-destructive"
            onClick={() => setDeleteConfirm(true)}
            type="button"
            variant="ghost"
          >
            <Trash2 className="mr-2 size-4" />
            Supprimer la transaction
          </Button>
        )
      ) : null}
    </form>
  )
}

/* ── Composant principal ────────────────────────────────────────────────────── */

export function TransactionFormSheet({
  accounts,
  categories,
  usedTags,
}: TransactionFormSheetProps) {
  const { open, initialValues, closeForm } = useTransactionForm()
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const isEdit = Boolean(initialValues?.id)
  const title = isEdit ? "Modifier la transaction" : "Nouvelle transaction"

  function handleSuccess() {
    closeForm()
    queryClient.invalidateQueries({ queryKey: ["transactions"] })
    window.dispatchEvent(new CustomEvent("transaction:mutated"))
  }

  if (isMobile) {
    return (
      <BottomSheet
        onOpenChange={(v) => {
          if (!v) {
            closeForm()
          }
        }}
        open={open}
        title={title}
      >
        <TransactionFormBody
          accounts={accounts}
          categories={categories}
          onSuccess={handleSuccess}
          usedTags={usedTags}
        />
      </BottomSheet>
    )
  }

  return (
    <Dialog
      onOpenChange={(v) => {
        if (!v) {
          closeForm()
        }
      }}
      open={open}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire de transaction
          </DialogDescription>
        </DialogHeader>
        <TransactionFormBody
          accounts={accounts}
          categories={categories}
          onSuccess={handleSuccess}
          usedTags={usedTags}
          wide
        />
      </DialogContent>
    </Dialog>
  )
}
