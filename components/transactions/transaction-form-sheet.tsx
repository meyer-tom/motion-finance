"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowRightLeft, Minus, Plus, X } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { type Resolver, useForm, useWatch } from "react-hook-form"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  createTransaction,
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
  id: string
  name: string
  type: "CHECKING" | "SAVINGS"
  color: string
  icon: string
  balance: number
}

export interface CategoryOption {
  id: string
  name: string
  icon: string
  color: string
  type: "EXPENSE" | "INCOME"
}

interface TransactionFormSheetProps {
  accounts: AccountOption[]
  categories: CategoryOption[]
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
  if (isPending) { return "Enregistrement…" }
  if (isEdit) { return "Enregistrer la transaction" }
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
              : "text-muted-foreground hover:text-foreground/70",
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

function AccountOption_({ account }: { account: AccountOption }) {
  return (
    <SelectItem value={account.id}>
      <span className="flex items-center gap-2">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: account.color }}
        />
        {account.name}
      </span>
    </SelectItem>
  )
}

function AccountSelects({
  accounts,
  selectedType,
  defaultAccountId,
  onAccountChange,
  onToAccountChange,
  accountError,
  toAccountError,
  selectedAccountId,
}: {
  accounts: AccountOption[]
  selectedType: TransactionType
  defaultAccountId: string
  onAccountChange: (v: string) => void
  onToAccountChange: (v: string) => void
  accountError?: string
  toAccountError?: string
  selectedAccountId: string
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
            {accounts.map((a) => <AccountOption_ account={a} key={a.id} />)}
          </SelectContent>
        </Select>
        {accountError ? (
          <p className="text-destructive text-xs">{accountError}</p>
        ) : null}
      </div>

      {selectedType === "TRANSFER" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-to-account">Compte destination</Label>
          <Select onValueChange={onToAccountChange}>
            <SelectTrigger id="tx-to-account">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {availableToAccounts.map((a) => (
                <AccountOption_ account={a} key={a.id} />
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

/* ── Sous-composants ────────────────────────────────────────────────────────── */

function CategoryGrid({
  categories,
  selectedCategoryId,
  onSelect,
  error,
}: {
  categories: CategoryOption[]
  selectedCategoryId: string | null | undefined
  onSelect: (id: string | null) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Catégorie</Label>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon)
          const isSelected = selectedCategoryId === cat.id
          return (
            <button
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-2 transition-all",
                isSelected
                  ? "border-transparent shadow-sm"
                  : "border-border hover:border-border/80 hover:bg-muted/50"
              )}
              key={cat.id}
              onClick={() => onSelect(isSelected ? null : cat.id)}
              style={
                isSelected
                  ? {
                      backgroundColor: `${cat.color}18`,
                      borderColor: `${cat.color}40`,
                    }
                  : {}
              }
              type="button"
            >
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: isSelected
                    ? `${cat.color}20`
                    : "transparent",
                }}
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
        })}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}

function TagsInput({
  tags,
  onTagsChange,
  error,
}: {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  error?: string
}) {
  const [tagInput, setTagInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag() {
    const trimmed = tagInput.trim().replace(TRAILING_COMMA_RE, "")
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      onTagsChange([...tags, trimmed])
    }
    setTagInput("")
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
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="tx-tags">
        Tags{" "}
        <span className="font-normal text-muted-foreground">(optionnel)</span>
      </Label>
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
          onBlur={addTag}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length === 0 ? "Entrée ou virgule pour ajouter…" : ""
          }
          ref={inputRef}
          value={tagInput}
        />
      </label>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}

/* ── Form body ─────────────────────────────────────────────────────────────── */

function TransactionFormBody({
  accounts,
  categories,
  onSuccess,
}: {
  accounts: AccountOption[]
  categories: CategoryOption[]
  onSuccess: () => void
}) {
  const { initialValues } = useTransactionForm()
  const isEdit = Boolean(initialValues?.id)

  const defaultAccountId =
    initialValues?.accountId ??
    (accounts.length === 1 ? (accounts[0]?.id ?? "") : "")

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
  const selectedCategoryId = useWatch({ control, name: "categoryId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const currentTags = useWatch({ control, name: "tags" }) ?? []

  const [amountDisplay, setAmountDisplay] = useState(
    initialValues?.amount == null ? "" : String(initialValues.amount)
  )

  const [isPending, startTransition] = useTransition()

  // Reset quand initialValues change (réouverture du formulaire)
  useEffect(() => {
    const newAccountId =
      initialValues?.accountId ??
      (accounts.length === 1 ? (accounts[0]?.id ?? "") : "")

    reset({
      type: initialValues?.type ?? "EXPENSE",
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

  const availableToAccounts = accounts.filter((a) => a.id !== selectedAccountId)

  function getSubmitLabel() {
    if (isPending) {
      return "Enregistrement…"
    }
    if (isEdit) {
      return "Enregistrer la transaction"
    }
    return "Ajouter la transaction"
  }

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
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

      {/* ── Suggestions (stub Issue 8.2) ── */}
      {isEdit ? null : (
        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Suggestions
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3].map((i) => (
              <Skeleton className="h-14 w-28 shrink-0 rounded-xl" key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Montant ── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-amount">Montant (€)</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
          <Input
            className="pl-7 font-semibold text-lg"
            id="tx-amount"
            inputMode="decimal"
            onChange={handleAmountChange}
            placeholder="0,00"
            type="text"
            value={amountDisplay}
          />
        </div>
        {errors.amount ? (
          <p className="text-destructive text-xs">{errors.amount.message}</p>
        ) : null}
      </div>

      {/* ── Date ── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-date">Date</Label>
        <Input
          defaultValue={formatDateInput(
            initialValues?.date instanceof Date
              ? initialValues.date
              : new Date()
          )}
          id="tx-date"
          onChange={(e) => {
            if (e.target.value) {
              setValue("date", parseLocalDate(e.target.value), {
                shouldValidate: true,
              })
            }
          }}
          type="date"
        />
        {errors.date ? (
          <p className="text-destructive text-xs">{errors.date.message}</p>
        ) : null}
      </div>

      {/* ── Compte source ── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-account">
          {selectedType === "TRANSFER" ? "Compte source" : "Compte"}
        </Label>
        <Select
          defaultValue={defaultAccountId || undefined}
          onValueChange={(v) =>
            setValue("accountId", v, { shouldValidate: true })
          }
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
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accountId ? (
          <p className="text-destructive text-xs">{errors.accountId.message}</p>
        ) : null}
      </div>

      {/* ── Compte destination (TRANSFER uniquement) ── */}
      {selectedType === "TRANSFER" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tx-to-account">Compte destination</Label>
          <Select
            onValueChange={(v) =>
              setValue("toAccountId", v, { shouldValidate: true })
            }
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
          error={errors.categoryId?.message}
          onSelect={(id) =>
            setValue("categoryId", id, { shouldValidate: true })
          }
          selectedCategoryId={selectedCategoryId}
        />
      )}

      {/* ── Description ── */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tx-description">
          Description{" "}
          <span className="font-normal text-muted-foreground">(optionnel)</span>
        </Label>
        <Input
          defaultValue={initialValues?.description ?? ""}
          id="tx-description"
          onChange={(e) =>
            setValue("description", e.target.value, { shouldValidate: true })
          }
          placeholder="Ex : Courses Leclerc"
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
        {getSubmitLabel()}
      </Button>
    </form>
  )
}

/* ── Composant principal ────────────────────────────────────────────────────── */

export function TransactionFormSheet({
  accounts,
  categories,
}: TransactionFormSheetProps) {
  const { open, initialValues, closeForm } = useTransactionForm()
  const isMobile = useIsMobile()

  const isEdit = Boolean(initialValues?.id)
  const title = isEdit ? "Modifier la transaction" : "Nouvelle transaction"

  function handleSuccess() {
    closeForm()
  }

  const body = (
    <TransactionFormBody
      accounts={accounts}
      categories={categories}
      onSuccess={handleSuccess}
    />
  )

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
        {body}
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
      <DialogContent className="flex max-h-[90dvh] max-w-md flex-col overflow-y-auto">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}
