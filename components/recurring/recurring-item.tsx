"use client"

import { ArrowRightLeft, EllipsisVertical, RefreshCw } from "lucide-react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleRecurring } from "@/lib/actions/recurring-transactions"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface RecurringItemData {
  account: {
    color: string
    icon: string
    id: string
    name: string
    type: "CHECKING" | "SAVINGS"
  }
  accountId: string
  amount: number
  category: { color: string; icon: string; id: string; name: string } | null
  categoryId: string | null
  description?: string | null
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  id: string
  isActive: boolean
  name: string
  toAccount: {
    color: string
    icon: string
    id: string
    name: string
    type: "CHECKING" | "SAVINGS"
  } | null
  toAccountId: string | null
  type: "EXPENSE" | "INCOME" | "TRANSFER"
}

/* ── Constantes ────────────────────────────────────────────────────────────── */

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Hebdo",
  MONTHLY: "Mensuel",
  QUARTERLY: "Trimestriel",
  YEARLY: "Annuel",
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

/* ── AccountBadge ──────────────────────────────────────────────────────────── */

function AccountBadge({ account }: { account: RecurringItemData["account"] }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap rounded-full px-1.5 py-px font-medium text-[10px]"
      style={{
        backgroundColor: `${account.color}18`,
        color: account.color,
      }}
    >
      {account.name}
    </span>
  )
}

/* ── RecurringItem ─────────────────────────────────────────────────────────── */

export function RecurringItem({
  item,
  onEdit,
  onDelete,
}: {
  item: RecurringItemData
  onEdit: (item: RecurringItemData) => void
  onDelete?: (item: RecurringItemData) => void
}) {
  const [isPending, startTransition] = useTransition()
  const isMobile = useIsMobile()
  const isTransfer = item.type === "TRANSFER"
  const isExpense = item.type === "EXPENSE"

  function getIcon() {
    if (isTransfer) {
      return ArrowRightLeft
    }
    if (item.category) {
      return getCategoryIcon(item.category.icon)
    }
    return RefreshCw
  }
  const Icon = getIcon()

  const iconColor = isTransfer
    ? "var(--color-transfer)"
    : (item.category?.color ?? "var(--color-muted-foreground)")

  function getAmountColor() {
    if (isTransfer) {
      return "text-[var(--color-transfer)]"
    }
    if (isExpense) {
      return "text-[var(--color-expense)]"
    }
    return "text-[var(--color-income)]"
  }

  function getAmountPrefix() {
    if (isTransfer) {
      return ""
    }
    if (isExpense) {
      return "−"
    }
    return "+"
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleRecurring(item.id)
    })
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-opacity",
        !item.isActive && "opacity-50"
      )}
    >
      {/* Zone cliquable : icône + infos + montant */}
      <button
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        onClick={() => onEdit(item)}
        type="button"
      >
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon className="size-4" style={{ color: iconColor }} />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate font-medium text-sm">{item.name}</p>
          <div className="mt-0.5 flex items-center gap-1 overflow-hidden text-muted-foreground text-xs">
            <RefreshCw className="size-3 shrink-0" />
            <span className="shrink-0">{FREQUENCY_LABELS[item.frequency]}</span>
            <span aria-hidden className="shrink-0">
              ·
            </span>
            {isTransfer && item.toAccount ? (
              <span className="flex min-w-0 items-center gap-1">
                <AccountBadge account={item.account} />
                <ArrowRightLeft className="size-2.5 shrink-0" />
                <AccountBadge account={item.toAccount} />
              </span>
            ) : (
              <AccountBadge account={item.account} />
            )}
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 font-semibold text-sm tabular-nums",
            getAmountColor()
          )}
        >
          {getAmountPrefix()}
          {item.amount.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </span>
      </button>

      {/* Toggle actif/inactif */}
      <Switch
        checked={item.isActive}
        disabled={isPending}
        onChange={handleToggle}
      />

      {/* Menu desktop uniquement */}
      {!isMobile && onDelete ? (
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
            <DropdownMenuItem onSelect={() => onEdit(item)}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(item)}
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
