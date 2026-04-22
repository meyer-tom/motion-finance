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
  Pencil,
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
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${c}18` }}
        >
          <Icon className="size-3.5" style={{ color: c }} />
        </div>

        <span className="min-w-0 flex-1 truncate text-sm">{category.name}</span>

        <button
          aria-label={`Modifier ${category.name}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setEditOpen(true)}
          type="button"
        >
          <Pencil className="size-3.5" />
        </button>

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
  onEdit,
}: {
  category: Category
  onEdit: (values: CategoryEditValues) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [txCount, setTxCount] = useState<number | null>(null)
  const Icon = ICON_MAP[category.icon] ?? Tag
  const c = category.color

  function handleDeleteClick() {
    startTransition(async () => {
      const count = await getTransactionCountForCategory(category.id)
      setTxCount(count)
      setDeleteOpen(true)
    })
  }

  function handleConfirmDelete() {
    startTransition(async () => {
      await deleteCategory(category.id)
      setDeleteOpen(false)
    })
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2.5">
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
            <DropdownMenuItem
              onSelect={() =>
                onEdit({
                  color: category.color,
                  icon: category.icon,
                  id: category.id,
                  name: category.name,
                  type: category.type,
                })
              }
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isPending}
              onSelect={handleDeleteClick}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {category.name} » ?</DialogTitle>
            <DialogDescription>
              {txCount !== null && txCount > 0 ? (
                <>
                  Cette catégorie est utilisée par{" "}
                  <strong>
                    {txCount} transaction{txCount > 1 ? "s" : ""}
                  </strong>
                  . Ces transactions perdront leur catégorie. Cette action est
                  irréversible.
                </>
              ) : (
                "Cette catégorie sera définitivement supprimée. Cette action est irréversible."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => setDeleteOpen(false)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button
              disabled={isPending}
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

/* ── Composant principal ────────────────────────────────────────────────────── */

export function CategoriesClient({
  systemCategories,
  userCategories,
}: CategoriesClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editValues, setEditValues] = useState<CategoryEditValues | undefined>(
    undefined
  )

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
        onOpenChange={handleOpenChange}
        open={sheetOpen}
      />
    </>
  )
}
