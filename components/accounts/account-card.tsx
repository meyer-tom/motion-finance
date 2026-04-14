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
import { Card, CardContent } from "@/components/ui/card"
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
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  SAVINGS: {
    label: "Épargne",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
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
  onEdit: (values: AccountEditValues) => void
}

export function AccountCard({ account, onEdit }: AccountCardProps) {
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
      <Card
        className="transition-shadow hover:shadow-sm"
        style={{ borderColor: `${c}30` }}
      >
        <CardContent className="p-4">
          {/* Ligne 1 : icône + nom + actions */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${c}18` }}
            >
              <IconComponent className="size-4" style={{ color: c }} />
            </div>

            <p className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
              {account.name}
            </p>

            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-medium text-xs ${TYPE_CONFIG[account.type].className}`}
            >
              {TYPE_CONFIG[account.type].label}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Options du compte"
                  className="-mr-1.5 size-6 text-muted-foreground/60 hover:text-foreground"
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
            className="mt-2 font-semibold text-base"
            currency="EUR"
            value={account.balance}
          />
        </CardContent>
      </Card>

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
