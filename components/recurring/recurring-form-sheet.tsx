"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowRightLeft, Minus, Plus } from "lucide-react"
import { useEffect, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { BottomSheet } from "@/components/shared/bottom-sheet"
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
import { Textarea } from "@/components/ui/textarea"
import {
  createRecurring,
  updateRecurring,
} from "@/lib/actions/recurring-transactions"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"
import {
  type RecurringInput,
  recurringSchema,
} from "@/lib/validations/recurring-transactions"

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface RecurringAccountOption {
  color: string
  icon: string
  id: string
  name: string
  type: "CHECKING" | "SAVINGS"
}

export interface RecurringCategoryOption {
  color: string
  icon: string
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
}

export interface RecurringEditValues {
  accountId: string
  amount: number
  categoryId?: string | null
  description?: string | null
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  id: string
  name: string
  toAccountId?: string | null
  type: "EXPENSE" | "INCOME" | "TRANSFER"
}

export interface RecurringFormSheetProps {
  accounts: RecurringAccountOption[]
  categories: RecurringCategoryOption[]
  initialValues?: RecurringEditValues
  onDelete?: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

/* ── Constantes ────────────────────────────────────────────────────────────── */

const RECURRING_TYPES = [
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

const FREQUENCY_OPTIONS = [
  { value: "WEEKLY" as const, label: "Hebdomadaire" },
  { value: "MONTHLY" as const, label: "Mensuel" },
  { value: "QUARTERLY" as const, label: "Trimestriel" },
  { value: "YEARLY" as const, label: "Annuel" },
]

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  CHECKING: "Courant",
  SAVINGS: "Épargne",
}

/* ── TypeSegmentedControl ──────────────────────────────────────────────────── */

function TypeSegmentedControl({
  value,
  onChange,
}: {
  value: "EXPENSE" | "INCOME" | "TRANSFER"
  onChange: (v: "EXPENSE" | "INCOME" | "TRANSFER") => void
}) {
  const activeIndex = RECURRING_TYPES.findIndex((t) => t.value === value)
  const activeColor = RECURRING_TYPES[activeIndex]?.color ?? ""

  return (
    <div className="relative flex rounded-xl bg-muted p-1">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 rounded-lg bg-background shadow-sm transition-all duration-200"
        style={{
          width: "calc((100% - 8px) / 3)",
          left: `calc(4px + ${activeIndex} * (100% - 8px) / 3)`,
        }}
      />
      {RECURRING_TYPES.map(({ value: v, label, icon: Icon }) => (
        <button
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-medium text-sm transition-colors",
            value === v
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          )}
          key={v}
          onClick={() => onChange(v)}
          style={value === v ? { color: activeColor } : {}}
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

/* ── AccountSelect ─────────────────────────────────────────────────────────── */

function AccountSelect({
  accounts,
  defaultValue,
  id,
  label,
  onChange,
  error,
}: {
  accounts: RecurringAccountOption[]
  defaultValue?: string
  id: string
  label: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select defaultValue={defaultValue ?? undefined} onValueChange={onChange}>
        <SelectTrigger id={id}>
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
                  {ACCOUNT_TYPE_LABEL[account.type]}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}

/* ── CategoryField ─────────────────────────────────────────────────────────── */

function CategoryField({
  categories,
  defaultCategoryId,
  error,
  onChange,
  selectedType,
}: {
  categories: RecurringCategoryOption[]
  defaultCategoryId?: string | null
  error?: string
  onChange: (v: string) => void
  selectedType: "EXPENSE" | "INCOME" | "TRANSFER"
}) {
  const filtered = categories.filter((c) => c.type === selectedType)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="rec-category">Catégorie</Label>
      <Select
        defaultValue={defaultCategoryId ?? undefined}
        key={selectedType}
        onValueChange={onChange}
      >
        <SelectTrigger id="rec-category">
          <SelectValue placeholder="Sélectionner une catégorie" />
        </SelectTrigger>
        <SelectContent>
          {filtered.map((cat) => {
            const Icon = getCategoryIcon(cat.icon)
            return (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Icon className="size-3" style={{ color: cat.color }} />
                  </span>
                  {cat.name}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  )
}

/* ── AccountsSection ───────────────────────────────────────────────────────── */

function AccountsSection({
  accounts,
  defaultAccountId,
  defaultToAccountId,
  isTransfer,
  selectedAccountId,
  accountError,
  toAccountError,
  onAccountChange,
  onToAccountChange,
}: {
  accounts: RecurringAccountOption[]
  defaultAccountId?: string
  defaultToAccountId?: string | null
  isTransfer: boolean
  selectedAccountId: string
  accountError?: string
  toAccountError?: string
  onAccountChange: (v: string) => void
  onToAccountChange: (v: string) => void
}) {
  const available = accounts.filter((a) => a.id !== selectedAccountId)

  return (
    <>
      <AccountSelect
        accounts={accounts}
        defaultValue={defaultAccountId}
        error={accountError}
        id="rec-account"
        label={isTransfer ? "Compte source" : "Compte"}
        onChange={onAccountChange}
      />
      {isTransfer ? (
        <AccountSelect
          accounts={available}
          defaultValue={defaultToAccountId ?? undefined}
          error={toAccountError}
          id="rec-to-account"
          label="Compte destination"
          onChange={onToAccountChange}
        />
      ) : null}
    </>
  )
}

/* ── Form body ─────────────────────────────────────────────────────────────── */

function RecurringFormBody({
  accounts,
  categories,
  initialValues,
  isEdit,
  onDelete,
  onSuccess,
}: {
  accounts: RecurringAccountOption[]
  categories: RecurringCategoryOption[]
  initialValues?: RecurringEditValues
  isEdit: boolean
  onDelete?: () => void
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function getSubmitLabel() {
    if (isPending) {
      return "Enregistrement…"
    }
    if (isEdit) {
      return "Enregistrer"
    }
    return "Créer la récurrente"
  }

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<RecurringInput>({
    resolver: standardSchemaResolver(recurringSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "EXPENSE",
      amount: initialValues?.amount ?? undefined,
      description: initialValues?.description ?? "",
      categoryId: initialValues?.categoryId ?? null,
      accountId: initialValues?.accountId ?? "",
      toAccountId: initialValues?.toAccountId ?? null,
      frequency: initialValues?.frequency ?? "MONTHLY",
    },
  })

  const selectedType = useWatch({ control, name: "type" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const isTransfer = selectedType === "TRANSFER"

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "EXPENSE",
      amount: initialValues?.amount ?? undefined,
      description: initialValues?.description ?? "",
      categoryId: initialValues?.categoryId ?? null,
      accountId: initialValues?.accountId ?? "",
      toAccountId: initialValues?.toAccountId ?? null,
      frequency: initialValues?.frequency ?? "MONTHLY",
    })
  }, [initialValues, reset])

  function handleTypeChange(v: "EXPENSE" | "INCOME" | "TRANSFER") {
    setValue("type", v)
    setValue("categoryId", null)
    setValue("toAccountId", null)
  }

  function onSubmit(data: RecurringInput) {
    startTransition(async () => {
      try {
        if (isEdit && initialValues?.id) {
          await updateRecurring(initialValues.id, data)
        } else {
          await createRecurring(data)
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

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Nom */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rec-name">Nom</Label>
        <Input
          id="rec-name"
          placeholder="Ex : Loyer, Netflix, Salaire…"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <Label>Type</Label>
        <TypeSegmentedControl
          onChange={handleTypeChange}
          value={selectedType}
        />
      </div>

      {/* Montant */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rec-amount">Montant</Label>
        <div className="relative">
          <Input
            className="pr-8"
            id="rec-amount"
            inputMode="decimal"
            placeholder="0,00"
            step="0.01"
            type="number"
            {...register("amount", { valueAsNumber: true })}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground text-sm">
            €
          </span>
        </div>
        {errors.amount ? (
          <p className="text-destructive text-xs">{errors.amount.message}</p>
        ) : null}
      </div>

      {/* Catégorie (masquée pour les virements) */}
      {isTransfer ? null : (
        <CategoryField
          categories={categories}
          defaultCategoryId={
            initialValues?.type === selectedType
              ? initialValues.categoryId
              : null
          }
          error={errors.categoryId?.message}
          onChange={(v) => setValue("categoryId", v)}
          selectedType={selectedType}
        />
      )}

      {/* Compte(s) */}
      <AccountsSection
        accountError={errors.accountId?.message}
        accounts={accounts}
        defaultAccountId={initialValues?.accountId}
        defaultToAccountId={initialValues?.toAccountId}
        isTransfer={isTransfer}
        onAccountChange={(v) => setValue("accountId", v)}
        onToAccountChange={(v) => setValue("toAccountId", v)}
        selectedAccountId={selectedAccountId}
        toAccountError={errors.toAccountId?.message}
      />

      {/* Fréquence */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rec-frequency">Fréquence</Label>
        <Select
          defaultValue={initialValues?.frequency ?? "MONTHLY"}
          onValueChange={(v) =>
            setValue(
              "frequency",
              v as "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
            )
          }
        >
          <SelectTrigger id="rec-frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCY_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rec-description">
          Description{" "}
          <span className="font-normal text-muted-foreground text-xs">
            (optionnelle)
          </span>
        </Label>
        <Textarea
          id="rec-description"
          placeholder="Ex : Appartement rue de la Paix"
          rows={2}
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-destructive text-xs">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      {errors.root ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {errors.root.message}
        </p>
      ) : null}

      <Button className="mt-1 w-full" disabled={isPending} type="submit">
        {getSubmitLabel()}
      </Button>

      {isEdit && onDelete ? (
        <Button
          className="w-full"
          disabled={isPending}
          onClick={onDelete}
          type="button"
          variant="ghost"
        >
          <span className="text-destructive">Supprimer ce modèle</span>
        </Button>
      ) : null}
    </form>
  )
}

/* ── Composant principal ────────────────────────────────────────────────────── */

export function RecurringFormSheet({
  open,
  onOpenChange,
  initialValues,
  onDelete,
  accounts,
  categories,
}: RecurringFormSheetProps) {
  const isMobile = useIsMobile()
  const isEdit = Boolean(initialValues?.id)
  const title = isEdit ? "Modifier la récurrente" : "Nouvelle récurrente"
  const description = isEdit
    ? "Modifiez les informations de cette transaction récurrente."
    : "Créez un modèle de transaction récurrente."

  function handleSuccess() {
    onOpenChange(false)
  }

  const body = (
    <RecurringFormBody
      accounts={accounts}
      categories={categories}
      initialValues={initialValues}
      isEdit={isEdit}
      onDelete={onDelete}
      onSuccess={handleSuccess}
    />
  )

  if (isMobile) {
    return (
      <BottomSheet
        description={description}
        onOpenChange={onOpenChange}
        open={open}
        title={title}
      >
        {body}
      </BottomSheet>
    )
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}
