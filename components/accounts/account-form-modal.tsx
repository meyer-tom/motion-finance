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
import { useEffect, useState } from "react"
import { type Resolver, useForm, useWatch } from "react-hook-form"
import { FormStepGuide } from "@/components/app/form-step-guide"
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

const GUIDE_STEPS = 5

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
  showGuide?: boolean
}

/* ── Form body (partagé entre Dialog et BottomSheet) ───────────────────────── */

function AccountFormBody({
  isEdit,
  onSuccess,
  initialValues,
  showGuide,
}: {
  isEdit: boolean
  onSuccess: () => void
  initialValues?: AccountEditValues
  showGuide?: boolean
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountInput>({
    // Cast nécessaire : standardSchemaResolver infère startingBalance: unknown avec z.coerce.number() en Zod v4
    resolver: standardSchemaResolver(createAccountSchema) as Resolver<CreateAccountInput>,
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
  const watchedName = useWatch({ control, name: "name" })
  const watchedType = useWatch({ control, name: "type" })
  const watchedBalance = useWatch({ control, name: "startingBalance" })

  const [guideStep, setGuideStep] = useState(showGuide && !isEdit ? 0 : -1)

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "CHECKING",
      startingBalance: 0,
      color: initialValues?.color ?? PALETTE[0],
      icon: initialValues?.icon ?? "Wallet",
    })
    setGuideStep(showGuide && !isEdit ? 0 : -1)
  }, [initialValues, reset, showGuide, isEdit])

  function handleGuideNext() {
    setGuideStep((s) => s + 1)
  }
  function handleGuidePrev() {
    setGuideStep((s) => Math.max(0, s - 1))
  }
  function handleGuideDismiss() {
    setGuideStep(-1)
  }

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

  const nameValid = !!watchedName?.trim()
  const typeValid = watchedType === "SAVINGS"
  const balanceValid = !Number.isNaN(watchedBalance) && watchedBalance >= 0

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Nom */}
      <div
        className={cn(
          "flex flex-col gap-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 0 && "opacity-40"
        )}
      >
        <Label htmlFor="account-name">Nom du compte</Label>
        <Input
          id="account-name"
          placeholder="Ex : Livret A, PEL, LEP…"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>
      {guideStep === 0 ? (
        <FormStepGuide
          checklistStep="savings"
          className="-mt-2"
          description="Donnez un nom clair à ce compte (ex : Livret A, PEL, LEP…)."
          isFirst={true}
          isLast={false}
          isValid={nameValid}
          onDismiss={handleGuideDismiss}
          onNext={handleGuideNext}
          onPrev={handleGuidePrev}
          stepIndex={0}
          title="Nom du compte"
          totalSteps={GUIDE_STEPS}
          validationMessage="Saisissez un nom pour continuer"
        />
      ) : null}

      {/* Type */}
      <div
        className={cn(
          "flex flex-col gap-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 1 && "opacity-40"
        )}
      >
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
      {guideStep === 1 ? (
        <FormStepGuide
          checklistStep="savings"
          className="-mt-2"
          description={
            'Sélectionnez "Épargne" pour créer un compte d\'épargne.'
          }
          isFirst={false}
          isLast={false}
          isValid={typeValid}
          onDismiss={handleGuideDismiss}
          onNext={handleGuideNext}
          onPrev={handleGuidePrev}
          stepIndex={1}
          title="Choisissez le type Épargne"
          totalSteps={GUIDE_STEPS}
          validationMessage='Sélectionnez "Épargne" pour continuer'
        />
      ) : null}

      {/* Solde de départ — création uniquement */}
      {isEdit ? null : (
        <>
          <div
            className={cn(
              "flex flex-col gap-1.5 rounded-xl transition-all duration-200",
              guideStep >= 0 && guideStep !== 2 && "opacity-40"
            )}
          >
            <Label htmlFor="starting-balance">Solde de départ (€)</Label>
            <Input
              id="starting-balance"
              step="0.01"
              type="number"
              {...register("startingBalance")}
            />
            {errors.startingBalance ? (
              <p className="text-destructive text-xs">
                {errors.startingBalance.message}
              </p>
            ) : null}
          </div>
          {guideStep === 2 ? (
            <FormStepGuide
              checklistStep="savings"
              className="-mt-2"
              description="Entrez le montant actuellement disponible sur ce compte (0 si vide)."
              isFirst={false}
              isLast={false}
              isValid={balanceValid}
              onDismiss={handleGuideDismiss}
              onNext={handleGuideNext}
              onPrev={handleGuidePrev}
              stepIndex={2}
              title="Solde de départ"
              totalSteps={GUIDE_STEPS}
              validationMessage="Entrez un montant valide (0 ou plus)"
            />
          ) : null}
        </>
      )}

      {/* Couleur & Icône */}
      <div
        className={cn(
          "flex flex-col gap-1.5 rounded-xl transition-all duration-200",
          guideStep >= 0 && guideStep !== 3 && "opacity-40"
        )}
      >
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
        <Label className="mt-1">Icône</Label>
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
      {guideStep === 3 ? (
        <FormStepGuide
          checklistStep="savings"
          className="-mt-2"
          description="Personnalisez la couleur et l'icône pour identifier facilement ce compte (optionnel)."
          isFirst={false}
          isLast={false}
          isValid={true}
          onDismiss={handleGuideDismiss}
          onNext={handleGuideNext}
          onPrev={handleGuidePrev}
          stepIndex={3}
          title="Couleur & icône"
          totalSteps={GUIDE_STEPS}
        />
      ) : null}

      {/* Guide dernière étape + Submit */}
      {guideStep === 4 ? (
        <FormStepGuide
          checklistStep="savings"
          description="Cliquez sur Créer le compte pour valider votre compte épargne."
          isFirst={false}
          isLast={true}
          isValid={true}
          onDismiss={handleGuideDismiss}
          onNext={handleGuideNext}
          onPrev={handleGuidePrev}
          stepIndex={4}
          title="Tout est prêt !"
          totalSteps={GUIDE_STEPS}
        />
      ) : null}
      <Button
        className={cn("w-full transition-all duration-200")}
        disabled={isSubmitting}
        type="submit"
      >
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
  showGuide,
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
          showGuide={showGuide}
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
          showGuide={showGuide}
        />
      </DialogContent>
    </Dialog>
  )
}
