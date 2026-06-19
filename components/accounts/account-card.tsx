"use client"

import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  DollarSign,
  EllipsisVertical,
  GripHorizontal,
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
import { useCurrency } from "@/lib/context/currency-context"
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
  { label: string; dotClass: string; badgeClass: string }
> = {
  CHECKING: {
    label: "Courant",
    dotClass: "bg-amber-400",
    badgeClass:
      "bg-amber-500/12 text-amber-500 dark:bg-amber-400/15 dark:text-amber-400",
  },
  SAVINGS: {
    label: "Épargne",
    dotClass: "bg-[var(--color-transfer)]",
    badgeClass: "bg-[var(--color-transfer)]/12 text-[var(--color-transfer)]",
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
  totalBalance: number
}

export function AccountCard({
  account,
  onEdit,
  dragListeners,
  isDragging,
  totalBalance,
}: AccountCardProps) {
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { currency } = useCurrency()

  const IconComponent = ICON_MAP[account.icon] ?? Wallet
  const c = account.color
  const cfg = TYPE_CONFIG[account.type]
  const proportion =
    totalBalance > 0 ? Math.min((account.balance / totalBalance) * 100, 100) : 0

  function handleConfirmDelete() {
    startTransition(async () => {
      await deleteAccount(account.id)
      setDeleteOpen(false)
    })
  }

  return (
    <>
      <div
        className={[
          "group/account relative overflow-hidden rounded-3xl border border-border bg-card",
          "transition-all duration-200",
          "hover:border-border-accent hover:shadow-black/8 hover:shadow-lg dark:hover:shadow-black/30",
          isDragging
            ? "scale-[0.97] opacity-60 shadow-2xl ring-1 ring-primary/40"
            : "",
        ].join(" ")}
      >
        {/* Ambient glow using account color */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${c}, transparent)`,
          }}
        />

        {/* Drag handle — top-center, shown on hover */}
        {dragListeners ? (
          <button
            aria-label="Réorganiser"
            className="absolute top-2 left-1/2 z-10 -translate-x-1/2 cursor-grab touch-none rounded-md px-2 py-0.5 text-muted-foreground/30 opacity-0 transition-all hover:text-muted-foreground/70 focus-visible:opacity-100 active:cursor-grabbing group-hover/account:opacity-100"
            type="button"
            {...dragListeners}
          >
            <GripHorizontal className="size-3.5" />
          </button>
        ) : null}

        <div className="relative p-5">
          {/* Header: icon + name + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${c}22` }}
              >
                <IconComponent className="size-5" style={{ color: c }} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-sm leading-tight">
                  {account.name}
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[10px] ${cfg.badgeClass}`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block size-1.5 rounded-full ${cfg.dotClass}`}
                  />
                  {cfg.label}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Options du compte"
                    className="size-7 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/account:opacity-100"
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
          </div>

          {/* Divider */}
          <div className="my-4 border-border/50 border-t" />

          {/* Balance */}
          <div>
            <p className="section-title mb-2">Solde</p>
            <AnimatedAmount
              className="font-black text-2xl leading-none tracking-tight"
              currency={currency}
              value={account.balance}
              variant="neutral"
            />
          </div>

          {/* Proportion bar */}
          {totalBalance > 0 ? (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                  Part du total
                </p>
                <p className="font-semibold text-[10px] text-muted-foreground tabular-nums">
                  {proportion.toFixed(0)}&nbsp;%
                </p>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${proportion}%`,
                    backgroundColor: c,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

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
