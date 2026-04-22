"use client"

import { MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTransactionForm } from "@/lib/context/transaction-form-context"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/utils/category-icons"

export interface TransactionItemData {
  account: { id: string; name: string; color: string; icon: string }
  amount: number
  category: { id: string; name: string; icon: string; color: string } | null
  date: string | Date
  description?: string | null
  id: string
  tags: string[]
  title: string
  toAccount: { id: string; name: string; color: string; icon: string } | null
  type: "EXPENSE" | "INCOME" | "TRANSFER"
}

interface TransactionItemProps {
  onDelete: (id: string) => void
  transaction: TransactionItemData
}


function AccountChip({
  account,
  className,
}: {
  account: { name: string; color: string }
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block min-w-0 shrink truncate rounded-full px-1.5 py-0.5 font-medium text-[11px] leading-none",
        className
      )}
      style={{
        backgroundColor: `${account.color}22`,
        color: account.color,
      }}
    >
      {account.name}
    </span>
  )
}

export function TransactionItem({
  transaction,
  onDelete,
}: TransactionItemProps) {
  const { openForm } = useTransactionForm()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isTransfer = transaction.type === "TRANSFER"
  const isIncome = transaction.type === "INCOME"

  const iconBgColor = isTransfer
    ? "color-mix(in oklch, var(--color-transfer) 15%, transparent)"
    : `${transaction.category?.color ?? "transparent"}22`

  let amountPrefix = "-"
  if (isIncome) amountPrefix = "+"
  if (isTransfer) amountPrefix = ""

  const CategoryIcon = transaction.category
    ? getCategoryIcon(transaction.category.icon)
    : null

  const amountClass = cn("font-semibold tabular-nums", {
    "text-[var(--color-income)]": isIncome,
    "text-[var(--color-expense)]": !(isIncome || isTransfer),
    "text-[var(--color-transfer)]": isTransfer,
  })

  const amountFormatted = `${amountPrefix}${transaction.amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`

  function handleEdit() {
    openForm({
      id: transaction.id,
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount,
      date: new Date(transaction.date),
      accountId: transaction.account.id,
      categoryId: transaction.category?.id,
      toAccountId: transaction.toAccount?.id,
      description: transaction.description ?? undefined,
      tags: transaction.tags,
    })
  }

  const chips = isTransfer ? (
    <span className="flex items-center gap-1">
      <AccountChip account={transaction.account} />
      <span className="text-[11px] text-muted-foreground">→</span>
      {transaction.toAccount ? (
        <AccountChip account={transaction.toAccount} />
      ) : null}
    </span>
  ) : (
    <AccountChip account={transaction.account} />
  )

  return (
    <div
      className="group flex cursor-pointer select-none [touch-action:manipulation] items-center gap-3 bg-background px-4 py-3 transition-colors hover:bg-muted/40 active:bg-muted/60"
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleEdit()
      }}
      role="button"
      tabIndex={0}
    >
      {/* Icône */}
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBgColor }}
      >
        {isTransfer ? (
          <svg
            aria-hidden="true"
            className="size-[18px]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            style={{ color: "var(--color-transfer)" }}
            viewBox="0 0 24 24"
          >
            <path d="m16 3 4 4-4 4" />
            <path d="M20 7H4" />
            <path d="m8 21-4-4 4-4" />
            <path d="M4 17h16" />
          </svg>
        ) : null}
        {!isTransfer && CategoryIcon ? (
          <CategoryIcon
            aria-hidden="true"
            className="size-[18px]"
            style={{ color: transaction.category?.color }}
          />
        ) : null}
      </div>

      {/* ── MOBILE ── */}
      <div className="min-w-0 flex-1 md:hidden">
        <span className="block truncate font-medium text-sm leading-tight">
          {transaction.title}
        </span>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden">
          {isTransfer ? (
            <>
              <AccountChip account={transaction.account} className="max-w-[44%]" />
              <span className="shrink-0 text-[11px] text-muted-foreground">→</span>
              {transaction.toAccount ? (
                <AccountChip account={transaction.toAccount} className="max-w-[44%]" />
              ) : null}
            </>
          ) : (
            <>
              <AccountChip account={transaction.account} className="max-w-[55%]" />
              {transaction.tags.slice(0, 2).map((tag) => (
                <Badge
                  className="h-[18px] shrink-0 rounded-full px-1.5 text-[10px] font-normal"
                  key={tag}
                  variant="secondary"
                >
                  {tag}
                </Badge>
              ))}
              {transaction.tags.length > 2 ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  +{transaction.tags.length - 2}
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* ── DESKTOP : col gauche (titre + chips) ── */}
      <div className="hidden min-w-0 flex-[2] md:block">
        <span className="block truncate font-medium text-sm leading-tight">
          {transaction.title}
        </span>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {chips}
          {transaction.tags.map((tag) => (
            <Badge
              className="h-4 px-1.5 font-normal text-[10px]"
              key={tag}
              variant="outline"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* ── DESKTOP : col centre (note) ── */}
      <div className="hidden min-w-0 flex-[2] overflow-hidden px-2 md:block">
        {transaction.description ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate text-muted-foreground text-xs italic cursor-default">
                {transaction.description}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {transaction.description}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {/* Montant — visible sur mobile et desktop */}
      <div className="shrink-0">
        <span className={cn(amountClass, "text-sm")}>{amountFormatted}</span>
      </div>

      {/* Actions (desktop uniquement — mobile : supprimer via le form d'édition) */}
      <div
        className="hidden shrink-0 items-center md:flex"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <Button
              className="h-7 px-2 text-xs"
              onClick={() => {
                onDelete(transaction.id)
                setConfirmDelete(false)
              }}
              size="sm"
              variant="destructive"
            >
              Confirmer
            </Button>
            <Button
              className="h-7 px-2 text-xs"
              onClick={() => setConfirmDelete(false)}
              size="sm"
              variant="ghost"
            >
              Annuler
            </Button>
          </div>
        ) : (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Options"
                className="size-7"
                size="icon"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={handleEdit}>Modifier</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 size-3.5" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
