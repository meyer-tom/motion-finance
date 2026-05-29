"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useTransactionForm } from "@/lib/context/transaction-form-context"
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

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date as string))
}

export function TransactionItem({
  transaction,
  onDelete,
}: TransactionItemProps) {
  const { openForm } = useTransactionForm()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isTransfer = transaction.type === "TRANSFER"
  const isIncome = transaction.type === "INCOME"

  const iconBg = isTransfer
    ? "color-mix(in oklch, var(--color-transfer) 15%, transparent)"
    : `${transaction.category?.color ?? "transparent"}22`

  const CategoryIcon = transaction.category
    ? getCategoryIcon(transaction.category.icon)
    : null

  let amountPrefix = "-"
  if (isIncome) {
    amountPrefix = "+"
  }
  if (isTransfer) {
    amountPrefix = ""
  }

  let amountColor = "var(--color-expense)"
  if (isIncome) {
    amountColor = "var(--color-income)"
  }
  if (isTransfer) {
    amountColor = "var(--color-transfer)"
  }

  const amountFormatted = `${amountPrefix}${transaction.amount.toLocaleString(
    "fr-FR",
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )} €`

  const subtitle = isTransfer
    ? `${transaction.account.name} → ${transaction.toAccount?.name ?? "?"} · ${formatDate(transaction.date)}`
    : `${transaction.category?.name ?? transaction.account.name} · ${formatDate(transaction.date)}`

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

  return (
    <div className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card px-5 py-5 transition-colors hover:bg-muted/30">
      {/* Bouton édition : icon + texte */}
      <button
        className="flex min-w-0 flex-1 items-center gap-4 text-left disabled:pointer-events-none"
        disabled={confirmDelete}
        onClick={handleEdit}
        type="button"
      >
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconBg }}
        >
          {isTransfer ? (
            <svg
              aria-hidden="true"
              className="size-5"
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
              className="size-5"
              style={{ color: transaction.category?.color }}
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-sm leading-tight">
            {transaction.title}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground leading-tight">
            {subtitle}
          </p>
        </div>
      </button>

      {/* Zone droite : montant + suppression */}
      {confirmDelete ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            className="h-7 rounded-lg bg-destructive/10 px-2 font-medium text-destructive text-xs"
            onClick={() => {
              onDelete(transaction.id)
              setConfirmDelete(false)
            }}
            type="button"
          >
            Supprimer
          </button>
          <button
            className="h-7 rounded-lg px-2 text-muted-foreground text-xs hover:text-foreground"
            onClick={() => setConfirmDelete(false)}
            type="button"
          >
            Annuler
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="font-semibold text-sm tabular-nums"
            style={{ color: amountColor }}
          >
            {amountFormatted}
          </span>
          <button
            aria-label="Supprimer la transaction"
            className="hidden size-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 md:flex"
            onClick={() => setConfirmDelete(true)}
            type="button"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
