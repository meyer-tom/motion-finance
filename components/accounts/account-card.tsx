"use client"

import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  DollarSign,
  EllipsisVertical,
  Home,
  Landmark,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useState, useTransition } from "react"
import { AnimatedAmount } from "@/components/shared/animated-amount"
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
import { deleteAccount } from "@/lib/actions/accounts"
import type { AccountEditValues } from "./account-form-modal"

const ICON_MAP: Record<string, React.ElementType> = {
  Wallet,
  CreditCard,
  PiggyBank,
  Building2,
  Home,
  ShoppingCart,
  Car,
  Briefcase,
  Landmark,
  TrendingUp,
  DollarSign,
  Banknote,
}

const TYPE_CONFIG: Record<
  "CHECKING" | "SAVINGS",
  { label: string; className: string }
> = {
  CHECKING: {
    label: "Courant",
    className: "bg-amber-500/15 text-amber-400",
  },
  SAVINGS: {
    label: "Épargne",
    className: "bg-[var(--color-transfer)]/15 text-[var(--color-transfer)]",
  },
}

interface AccountCardProps {
  account: {
    id: string
    name: string
    type: "CHECKING" | "SAVINGS"
    color: string
    icon: string
    balance: number
  }
  dragListeners?: Record<string, React.EventHandler<React.SyntheticEvent>>
  isDragging?: boolean
  onEdit: (values: AccountEditValues) => void
}

export function AccountCard({ account, onEdit, dragListeners, isDragging }: AccountCardProps) {
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const IconComponent = ICON_MAP[account.icon] ?? Wallet
  const c = account.color

  function handleConfirmDelete() {
    startTransition(async () => {
      await deleteAccount(account.id)
      setDeleteOpen(false)
    })
  }

  return (
    <>
      <div className={`group/account overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-border-accent hover:bg-surface-elevated hover:shadow-lg hover:shadow-black/20 ${isDragging ? "opacity-60 shadow-2xl ring-1 ring-primary/50" : ""}`}>
        {/* Bande de couleur — accent color du compte */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${c}, ${c}40)`,
          }}
        />
        <div className="p-4">
          {/* Ligne 1 : icône + nom + actions */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${c}1f` }}
            >
              <IconComponent className="size-[18px]" style={{ color: c }} />
            </div>

            {dragListeners ? (
              <button
                aria-label="Réorganiser"
                className="-ml-1 cursor-grab touch-none text-muted-foreground/40 transition-colors hover:text-muted-foreground active:cursor-grabbing"
                type="button"
                {...dragListeners}
              >
                <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </svg>
              </button>
            ) : null}

            <p className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">
              {account.name}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Options du compte"
                  className="-mr-1.5 size-7 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/account:opacity-100"
                  size="icon"
                  variant="ghost"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() =>
                    onEdit({
                      id: account.id,
                      name: account.name,
                      type: account.type,
                      color: account.color,
                      icon: account.icon,
                    })
                  }
                >
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Ligne 2 : solde */}
          <AnimatedAmount
            className="mt-3 block font-bold text-2xl"
            currency="EUR"
            value={account.balance}
          />

          {/* Ligne 3 : badge type */}
          <span
            className={`mt-2 inline-flex shrink-0 rounded-full px-2 py-0.5 font-medium text-[11px] ${TYPE_CONFIG[account.type].className}`}
          >
            {TYPE_CONFIG[account.type].label}
          </span>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {account.name} » ?</DialogTitle>
            <DialogDescription>
              Toutes les transactions liées à ce compte seront définitivement
              supprimées. Cette action est irréversible.
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
