"use client"

import { format, isToday, isYesterday, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useEffect, useMemo, useRef } from "react"
import { TransactionItem, type TransactionItemData } from "./transaction-item"
import { TransactionLoadMoreSkeleton } from "./transaction-skeletons"

interface DateGroup {
  dateKey: string
  label: string
  transactions: TransactionItemData[]
}

function groupTransactionsByDate(
  transactions: TransactionItemData[]
): DateGroup[] {
  const map = new Map<string, TransactionItemData[]>()

  for (const tx of transactions) {
    const day = startOfDay(new Date(tx.date))
    const key = day.toISOString()
    const existing = map.get(key)
    if (existing) {
      existing.push(tx)
    } else {
      map.set(key, [tx])
    }
  }

  return Array.from(map.entries()).map(([key, txs]) => {
    const date = new Date(key)
    let label: string
    if (isToday(date)) {
      label = "Aujourd'hui"
    } else if (isYesterday(date)) {
      label = "Hier"
    } else {
      label = format(date, "EEEE d MMMM yyyy", { locale: fr })
      label = label.charAt(0).toUpperCase() + label.slice(1)
    }
    return { label, dateKey: key, transactions: txs }
  })
}

interface TransactionListProps {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onDelete: (id: string) => void
  onFetchNextPage: () => void
  transactions: TransactionItemData[]
}

export function TransactionList({
  transactions,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  onDelete,
}: TransactionListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const groups = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onFetchNextPage()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage])

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section className="flex flex-col gap-2" key={group.dateKey}>
          <div className="flex items-center justify-between px-1">
            <span className="section-title">{group.label}</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {group.transactions.length}{" "}
              {group.transactions.length > 1 ? "opérations" : "opération"}
            </span>
          </div>

          {group.transactions.map((tx) => (
            <TransactionItem key={tx.id} onDelete={onDelete} transaction={tx} />
          ))}
        </section>
      ))}

      {isFetchingNextPage ? <TransactionLoadMoreSkeleton /> : null}

      <div aria-hidden="true" className="h-4" ref={sentinelRef} />
    </div>
  )
}
