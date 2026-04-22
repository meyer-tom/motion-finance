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
    <div>
      {groups.map((group) => (
        <section key={group.dateKey}>
          {/* Header date sticky */}
          <div className="sticky top-14 z-10 flex items-center gap-3 bg-background px-4 py-2">
            <span className="whitespace-nowrap font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Items du groupe */}
          <div className="divide-y divide-border/50">
            {group.transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                onDelete={onDelete}
                transaction={tx}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Skeleton "chargement suivant" */}
      {isFetchingNextPage ? <TransactionLoadMoreSkeleton /> : null}

      {/* Sentinel IntersectionObserver */}
      <div aria-hidden="true" className="h-4" ref={sentinelRef} />
    </div>
  )
}
