"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import {
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Coffee,
  Dumbbell,
  Film,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Laptop,
  MoreHorizontal,
  Music,
  Phone,
  Plane,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Zap,
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
import { createCategory, updateCategory } from "@/lib/actions/categories"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import {
  type CreateCategoryInput,
  createCategorySchema,
} from "@/lib/validations/categories"

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
  { key: "ShoppingCart", component: ShoppingCart },
  { key: "UtensilsCrossed", component: UtensilsCrossed },
  { key: "Car", component: Car },
  { key: "Home", component: Home },
  { key: "Heart", component: Heart },
  { key: "Gamepad2", component: Gamepad2 },
  { key: "ShoppingBag", component: ShoppingBag },
  { key: "RefreshCw", component: RefreshCw },
  { key: "GraduationCap", component: GraduationCap },
  { key: "Dumbbell", component: Dumbbell },
  { key: "Plane", component: Plane },
  { key: "Gift", component: Gift },
  { key: "Briefcase", component: Briefcase },
  { key: "Laptop", component: Laptop },
  { key: "RotateCcw", component: RotateCcw },
  { key: "TrendingUp", component: TrendingUp },
  { key: "PlusCircle", component: PlusCircle },
  { key: "MoreHorizontal", component: MoreHorizontal },
  { key: "Coffee", component: Coffee },
  { key: "Music", component: Music },
  { key: "Film", component: Film },
  { key: "Globe", component: Globe },
  { key: "Star", component: Star },
  { key: "Tag", component: Tag },
  { key: "Zap", component: Zap },
  { key: "Wallet", component: Wallet },
  { key: "Building2", component: Building2 },
  { key: "BookOpen", component: BookOpen },
  { key: "Headphones", component: Headphones },
  { key: "Phone", component: Phone },
]

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface CategoryEditValues {
  color: string
  icon: string
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
}

export interface CategoryFormSheetProps {
  initialValues?: CategoryEditValues
  onOpenChange: (open: boolean) => void
  open: boolean
}

/* ── Form body ─────────────────────────────────────────────────────────────── */

function CategoryFormBody({
  isEdit,
  initialValues,
  onSuccess,
}: {
  isEdit: boolean
  initialValues?: CategoryEditValues
  onSuccess: () => void
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: standardSchemaResolver(createCategorySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "EXPENSE",
      color: initialValues?.color ?? PALETTE[0],
      icon: initialValues?.icon ?? "ShoppingCart",
    },
  })

  const selectedColor = useWatch({ control, name: "color" })
  const selectedIcon = useWatch({ control, name: "icon" })

  useEffect(() => {
    reset({
      name: initialValues?.name ?? "",
      type: initialValues?.type ?? "EXPENSE",
      color: initialValues?.color ?? PALETTE[0],
      icon: initialValues?.icon ?? "ShoppingCart",
    })
  }, [initialValues, reset])

  const submitLabel = isEdit ? "Enregistrer" : "Créer la catégorie"

  async function onSubmit(data: CreateCategoryInput) {
    try {
      if (isEdit && initialValues?.id) {
        await updateCategory(initialValues.id, data)
      } else {
        await createCategory(data)
      }
      onSuccess()
    } catch (err) {
      setError("name", {
        message: err instanceof Error ? err.message : "Une erreur est survenue",
      })
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Nom */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-name">Nom</Label>
        <Input
          id="cat-name"
          placeholder="Ex : Courses bio"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-type">Type</Label>
        <Select
          defaultValue={initialValues?.type ?? "EXPENSE"}
          onValueChange={(v) => setValue("type", v as "EXPENSE" | "INCOME")}
        >
          <SelectTrigger id="cat-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Dépense</SelectItem>
            <SelectItem value="INCOME">Revenu</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

export function CategoryFormSheet({
  open,
  onOpenChange,
  initialValues,
}: CategoryFormSheetProps) {
  const isMobile = useIsMobile()
  const isEdit = Boolean(initialValues?.id)
  const title = isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"
  const description = isEdit
    ? "Modifiez les informations de votre catégorie."
    : "Créez une catégorie personnalisée."

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
        <CategoryFormBody
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
        <CategoryFormBody
          initialValues={initialValues}
          isEdit={isEdit}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
