"use client"

import {
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Coffee,
  CreditCard,
  Dumbbell,
  EllipsisVertical,
  Film,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Landmark,
  Laptop,
  MoreHorizontal,
  Music,
  Pencil,
  Phone,
  PiggyBank,
  Plane,
  Plus,
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
import { useState, useTransition } from "react"
import type { CategoryEditValues } from "@/components/categories/category-form-sheet"
import { CategoryFormSheet } from "@/components/categories/category-form-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  deleteCategory,
  getTransactionCountForCategory,
  toggleCategoryVisibility,
} from "@/lib/actions/categories"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"

/* ── Icon map ──────────────────────────────────────────────────────────────── */

const ICON_MAP: Record<string, React.ElementType> = {
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Coffee,
  CreditCard,
  Dumbbell,
  Film,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Landmark,
  Laptop,
  MoreHorizontal,
  Music,
  Phone,
  PiggyBank,
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
}

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Category {
  color: string
  icon: string
  id: string
  isHidden: boolean
  isSystem: boolean
  name: string
  type: "EXPENSE" | "INCOME"
}

interface CategoriesClientProps {
  systemCategories: Category[]
  userCategories: Category[]
}

/* ── Switch inline ─────────────────────────────────────────────────────────── */

function Switch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
}) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input"
      )}
      disabled={disabled}
      onClick={onChange}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

/* ── Row catégorie système ─────────────────────────────────────────────────── */

function SystemCategoryRow({ category }: { category: Category }) {
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const isMobile = useIsMobile()
  const Icon = ICON_MAP[category.icon] ?? Tag
  const c = category.color

  function handleToggle() {
    startTransition(async () => {
      await toggleCategoryVisibility(category.id)
    })
  }

  const editValues: CategoryEditValues = {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 transition-opacity",
          category.isHidden && "opacity-40"
        )}
      >
        {/* Zone cliquable : icône + nom */}
        <button
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
          onClick={() => setEditOpen(true)}
          type="button"
        >
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${c}18` }}
          >
            <Icon className="size-3.5" style={{ color: c }} />
          </div>
          <span className="min-w-0 flex-1 truncate text-sm">
            {category.name}
          </span>
        </button>

        {/* Crayon desktop uniquement */}
        {isMobile ? null : (
          <button
            aria-label={`Modifier ${category.name}`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setEditOpen(true)}
            type="button"
          >
            <Pencil className="size-3.5" />
          </button>
        )}

        <Switch
          checked={!category.isHidden}
          disabled={isPending}
          onChange={handleToggle}
        />
      </div>

      <CategoryFormSheet
        initialValues={editValues}
        isSystem
        onOpenChange={setEditOpen}
        open={editOpen}
      />
    </>
  )
}

/* ── Groupe de catégories système par type ─────────────────────────────────── */

function SystemCategoryGroup({
  categories,
  label,
}: {
  categories: Category[]
  label: string
}) {
  if (categories.length === 0) {
    return null
  }

  return (
    <div>
      <p className="mb-1 px-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </p>
      <div className="divide-y overflow-hidden rounded-xl border">
        {categories.map((cat) => (
          <SystemCategoryRow category={cat} key={cat.id} />
        ))}
      </div>
    </div>
  )
}

/* ── Row catégorie personnalisée ───────────────────────────────────────────── */

function UserCategoryRow({
  category,
  onDelete,
  onEdit,
}: {
  category: Category
  onDelete: (id: string, name: string) => void
  onEdit: (values: CategoryEditValues) => void
}) {
  const isMobile = useIsMobile()
  const Icon = ICON_MAP[category.icon] ?? Tag
  const c = category.color

  const editValues: CategoryEditValues = {
    color: category.color,
    icon: category.icon,
    id: category.id,
    name: category.name,
    type: category.type,
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {/* Zone cliquable : icône + nom + badge */}
      <button
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        onClick={() => onEdit(editValues)}
        type="button"
      >
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${c}18` }}
        >
          <Icon className="size-3.5" style={{ color: c }} />
        </div>

        <span className="min-w-0 flex-1 truncate text-sm">{category.name}</span>

        <Badge variant={category.type === "EXPENSE" ? "expense" : "income"}>
          {category.type === "EXPENSE" ? "Dépense" : "Revenu"}
        </Badge>
      </button>

      {/* Dropdown desktop uniquement */}
      {isMobile ? null : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Options"
              className="-mr-1.5 size-7 text-muted-foreground/60 hover:text-foreground"
              size="icon"
              variant="ghost"
            >
              <EllipsisVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(editValues)}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(category.id, category.name)}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

/* ── Composant principal ────────────────────────────────────────────────────── */

export function CategoriesClient({
  systemCategories,
  userCategories,
}: CategoriesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editValues, setEditValues] = useState<CategoryEditValues | undefined>(
    undefined
  )
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
    txCount: number | null
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  function getDeleteDescription() {
    if (!deleteTarget) {
      return ""
    }
    if (deleteTarget.txCount === null) {
      return "Vérification en cours…"
    }
    if (deleteTarget.txCount > 0) {
      return null // JSX rendu inline
    }
    return "Cette catégorie sera définitivement supprimée. Cette action est irréversible."
  }

  const expenseCategories = systemCategories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = systemCategories.filter((c) => c.type === "INCOME")

  function handleEdit(values: CategoryEditValues) {
    setEditValues(values)
    setSheetOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setSheetOpen(open)
    if (!open) {
      setEditValues(undefined)
    }
  }

  function triggerDelete(id: string, name: string) {
    setSheetOpen(false)
    setEditValues(undefined)
    setDeleteTarget({ id, name, txCount: null })
    getTransactionCountForCategory(id).then((count) => {
      setDeleteTarget((prev) =>
        prev?.id === id ? { ...prev, txCount: count } : prev
      )
    })
  }

  // Déclenché depuis le bouton delete dans le form sheet
  function handleDeleteRequest() {
    if (!editValues) {
      return
    }
    triggerDelete(editValues.id, editValues.name)
  }

  // Déclenché depuis le dropdown desktop
  function handleDeleteFromRow(id: string, name: string) {
    triggerDelete(id, name)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }
    startTransition(async () => {
      await deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <>
      {/* Catégories système */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-base">Catégories système</h2>
          <p className="text-muted-foreground text-sm">
            Masquez les catégories que vous n'utilisez pas.
          </p>
        </div>

        <SystemCategoryGroup categories={expenseCategories} label="Dépenses" />
        <SystemCategoryGroup categories={incomeCategories} label="Revenus" />
      </section>

      {/* Catégories personnalisées */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-base">Mes catégories</h2>
            <p className="text-muted-foreground text-sm">
              {userCategories.length === 0
                ? "Aucune catégorie personnalisée."
                : `${userCategories.length} catégorie${userCategories.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditValues(undefined)
              setSheetOpen(true)
            }}
            size="sm"
          >
            <Plus className="size-4" />
            Nouvelle catégorie
          </Button>
        </div>

        {userCategories.length > 0 ? (
          <div className="divide-y overflow-hidden rounded-xl border">
            {userCategories.map((cat) => (
              <UserCategoryRow
                category={cat}
                key={cat.id}
                onDelete={handleDeleteFromRow}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              Créez vos propres catégories pour affiner le suivi de vos
              finances.
            </p>
            <Button
              onClick={() => {
                setEditValues(undefined)
                setSheetOpen(true)
              }}
              variant="outline"
            >
              <Plus className="size-4" />
              Créer une catégorie
            </Button>
          </div>
        )}
      </section>

      <CategoryFormSheet
        initialValues={editValues}
        onDelete={handleDeleteRequest}
        onOpenChange={handleOpenChange}
        open={sheetOpen}
      />

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        open={Boolean(deleteTarget)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {deleteTarget?.name} » ?</DialogTitle>
            <DialogDescription>
              {deleteTarget?.txCount !== null &&
              deleteTarget?.txCount &&
              deleteTarget.txCount > 0 ? (
                <>
                  Cette catégorie est utilisée par{" "}
                  <strong>
                    {deleteTarget.txCount} transaction
                    {deleteTarget.txCount > 1 ? "s" : ""}
                  </strong>
                  . Ces transactions perdront leur catégorie. Cette action est
                  irréversible.
                </>
              ) : (
                getDeleteDescription()
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => setDeleteTarget(null)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button
              disabled={isPending || deleteTarget?.txCount === null}
              onClick={handleConfirmDelete}
              variant="destructive"
            >
              {isPending ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
