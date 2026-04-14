"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  DollarSign,
  Home,
  Landmark,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useEffect } from "react"
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
import { createAccount, updateAccount } from "@/lib/actions/accounts"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import {
  type CreateAccountInput,
  createAccountSchema,
  type UpdateAccountInput,
} from "@/lib/validations/accounts"

/* ── Constantes ────────────────────────────────────────────────────────────── */

const PALETTE = [
  "#6d28d9",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#64748b",
]

const ICONS = [
  { key: "Wallet", component: Wallet },
  { key: "CreditCard", component: CreditCard },
  { key: "PiggyBank", component: PiggyBank },
  { key: "Building2", component: Building2 },
  { key: "Home", component: Home },
  { key: "ShoppingCart", component: ShoppingCart },
  { key: "Car", component: Car },
  { key: "Briefcase", component: Briefcase },
  { key: "Landmark", component: Landmark },
  { key: "TrendingUp", component: TrendingUp },
  { key: "DollarSign", component: DollarSign },
  { key: "Banknote", component: Banknote },
]

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface AccountEditValues {
  color: string
  icon: string
  id: string
  name: string
  type: "CHECKING" | "SAVINGS"
}

export interface AccountFormModalProps {
  initialValues?: AccountEditValues
  onOpenChange: (open: boolean) => void
  open: boolean
}

/* ── Form body (partagé entre Dialog et BottomSheet) ───────────────────────── */

function AccountFormBody({
  isEdit,
  onSuccess,
  initialValues,
}: {
  isEdit: boolean
  onSuccess: () => void
  initialValues?: AccountEditValues
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountInput>({
    resolver: standardSchemaResolver(createAccountSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "CHECKING",
      startingBalance: 0,
      color: initialValues?.color ?? PALETTE[0],
      icon: initialValues?.icon ?? "Wallet",
    },
  })

  const selectedColor = useWatch({ control, name: "color" })
  const selectedIcon = useWatch({ control, name: "icon" })

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "CHECKING",
      startingBalance: 0,
      color: initialValues?.color ?? PALETTE[0],
      icon: initialValues?.icon ?? "Wallet",
    })
  }, [initialValues, reset])

  async function onSubmit(data: CreateAccountInput) {
    if (isEdit && initialValues?.id) {
      const payload: UpdateAccountInput = {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
      }
      await updateAccount(initialValues.id, payload)
    } else {
      await createAccount(data)
    }
    onSuccess()
  }

  const submitLabel = isEdit ? "Enregistrer" : "Créer le compte"

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Nom */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account-name">Nom du compte</Label>
        <Input
          id="account-name"
          placeholder="Ex : Compte courant BNP"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account-type">Type</Label>
        <Select
          defaultValue={initialValues?.type ?? "CHECKING"}
          onValueChange={(v) => setValue("type", v as "CHECKING" | "SAVINGS")}
        >
          <SelectTrigger id="account-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CHECKING">Courant</SelectItem>
            <SelectItem value="SAVINGS">Épargne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Solde de départ — création uniquement */}
      {isEdit ? null : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="starting-balance">Solde de départ (€)</Label>
          <Input
            id="starting-balance"
            step="0.01"
            type="number"
            {...register("startingBalance", { valueAsNumber: true })}
          />
          {errors.startingBalance ? (
            <p className="text-destructive text-xs">
              {errors.startingBalance.message}
            </p>
          ) : null}
        </div>
      )}

      {/* Couleur */}
      <div className="flex flex-col gap-1.5">
        <Label>Couleur</Label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((color) => (
            <button
              aria-label={`Couleur ${color}`}
              className={cn(
                "size-8 rounded-full ring-offset-background transition-transform active:scale-95",
                selectedColor === color && "ring-2 ring-offset-2"
              )}
              key={color}
              onClick={() => setValue("color", color)}
              style={{
                backgroundColor: color,
                ...(selectedColor === color
                  ? ({ "--tw-ring-color": color } as React.CSSProperties)
                  : {}),
              }}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Icône */}
      <div className="flex flex-col gap-1.5">
        <Label>Icône</Label>
        <div className="grid grid-cols-6 gap-2">
          {ICONS.map(({ key, component: Icon }) => (
            <button
              aria-label={key}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl border transition-colors",
                selectedIcon === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 hover:bg-muted"
              )}
              key={key}
              onClick={() => setValue("icon", key)}
              type="button"
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button className="mt-1 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  )
}

/* ── Composant principal ────────────────────────────────────────────────────── */

export function AccountFormModal({
  open,
  onOpenChange,
  initialValues,
}: AccountFormModalProps) {
  const isMobile = useIsMobile()
  const isEdit = Boolean(initialValues?.id)
  const title = isEdit ? "Modifier le compte" : "Nouveau compte"
  const description = isEdit
    ? "Modifiez les informations de votre compte."
    : "Renseignez les informations de votre nouveau compte."

  function handleSuccess() {
    onOpenChange(false)
  }

  if (isMobile) {
    return (
      <BottomSheet
        description={description}
        onOpenChange={onOpenChange}
        open={open}
        title={title}
      >
        <AccountFormBody
          initialValues={initialValues}
          isEdit={isEdit}
          onSuccess={handleSuccess}
        />
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
        <AccountFormBody
          initialValues={initialValues}
          isEdit={isEdit}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
