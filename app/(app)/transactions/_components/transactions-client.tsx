"use client"

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteTransaction, getTransactions } from "@/lib/actions/transactions"
import { useTransactionForm } from "@/lib/context/transaction-form-context"
import { TransactionEmpty } from "./transaction-empty"
import { type FiltersValue, TransactionFilters } from "./transaction-filters"
import type { TransactionItemData } from "./transaction-item"
import { TransactionList } from "./transaction-list"
import { TransactionListSkeleton } from "./transaction-skeletons"

type TxType = "EXPENSE" | "INCOME" | "TRANSFER" | ""

interface TransactionsClientProps {
  accounts: { id: string; name: string; color: string }[]
  categories: {
    id: string
    name: string
    icon: string
    color: string
    type: "EXPENSE" | "INCOME"
  }[]
  initialData?: Awaited<ReturnType<typeof getTransactions>>
}

// ─── URL params helpers ──────────────────────────────────────────────────────

function readFilters(sp: URLSearchParams): FiltersValue {
  return {
    search: sp.get("search") ?? "",
    type: (sp.get("type") ?? "") as TxType,
    accountIds: sp.getAll("accountId"),
    categoryIds: sp.getAll("categoryId"),
    dateFrom: sp.get("dateFrom") ?? "",
    dateTo: sp.get("dateTo") ?? "",
    amountMin: sp.get("amountMin") ?? "",
    amountMax: sp.get("amountMax") ?? "",
    tags: sp.getAll("tag"),
  }
}

function writeFilters(
  current: URLSearchParams,
  next: Partial<FiltersValue>
): URLSearchParams {
  const sp = new URLSearchParams(current)
  const merged = { ...readFilters(current), ...next }

  sp.delete("search")
  sp.delete("type")
  sp.delete("accountId")
  sp.delete("categoryId")
  sp.delete("dateFrom")
  sp.delete("dateTo")
  sp.delete("amountMin")
  sp.delete("amountMax")
  sp.delete("tag")

  if (merged.search) {
    sp.set("search", merged.search)
  }
  if (merged.type) {
    sp.set("type", merged.type)
  }
  for (const id of merged.accountIds) {
    sp.append("accountId", id)
  }
  for (const id of merged.categoryIds) {
    sp.append("categoryId", id)
  }
  if (merged.dateFrom) {
    sp.set("dateFrom", merged.dateFrom)
  }
  if (merged.dateTo) {
    sp.set("dateTo", merged.dateTo)
  }
  if (merged.amountMin) {
    sp.set("amountMin", merged.amountMin)
  }
  if (merged.amountMax) {
    sp.set("amountMax", merged.amountMax)
  }
  for (const t of merged.tags) {
    sp.append("tag", t)
  }

  return sp
}

// ─── Composant ──────────────────────────────────────────────────────────────

export function TransactionsClient({
  accounts,
  categories,
  initialData,
}: TransactionsClientProps) {
  const { openForm } = useTransactionForm()
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Memoïzer les filtres via la représentation string (primitive dep stable)
  const searchParamsStr = searchParams.toString()
  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParamsStr)),
    [searchParamsStr]
  )

  const handleFiltersChange = useCallback(
    (next: Partial<FiltersValue>) => {
      startTransition(() => {
        const sp = writeFilters(searchParams, next)
        const qs = sp.toString()
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [router, pathname])

  // Filtres normalisés pour la query key et la server action
  const queryFilters = useMemo(
    () => ({
      search: filters.search || undefined,
      type: (filters.type || undefined) as
        | "EXPENSE"
        | "INCOME"
        | "TRANSFER"
        | undefined,
      accountIds: filters.accountIds.length ? filters.accountIds : undefined,
      categoryIds: filters.categoryIds.length ? filters.categoryIds : undefined,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      amountMin: filters.amountMin ? Number(filters.amountMin) : undefined,
      amountMax: filters.amountMax ? Number(filters.amountMax) : undefined,
      tags: filters.tags.length ? filters.tags : undefined,
    }),
    [filters]
  )

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["transactions", queryFilters],
      queryFn: ({ pageParam }) =>
        getTransactions({
          ...queryFilters,
          cursor: pageParam as string | undefined,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialData:
        initialData && !searchParams.toString()
          ? {
              pages: [initialData],
              pageParams: [undefined],
            }
          : undefined,
    })

  const transactions = useMemo(
    () => (data?.pages.flatMap((p) => p.items) ?? []) as TransactionItemData[],
    [data]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTransaction(id)
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
    [queryClient]
  )

  // Rafraîchit la liste après create/update depuis le form sheet
  useEffect(() => {
    function onMutated() {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }
    window.addEventListener("transaction:mutated", onMutated)
    return () => window.removeEventListener("transaction:mutated", onMutated)
  }, [queryClient])

  // Calcul filtres actifs (hors search qui a son propre indicateur)
  const activeFilterCount = useMemo(
    () =>
      [
        filters.type,
        ...(filters.accountIds.length ? ["accounts"] : []),
        ...(filters.categoryIds.length ? ["categories"] : []),
        filters.dateFrom || filters.dateTo ? "date" : "",
        filters.amountMin || filters.amountMax ? "amount" : "",
        ...filters.tags,
      ].filter(Boolean).length,
    [filters]
  )

  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.search)

  function renderContent() {
    if (transactions.length === 0) {
      return (
        <TransactionEmpty
          hasActiveFilters={hasActiveFilters}
          onAddTransaction={() => openForm()}
          onClearFilters={handleClearFilters}
        />
      )
    }
    return (
      <TransactionList
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onDelete={handleDelete}
        onFetchNextPage={fetchNextPage}
        transactions={transactions}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-xl">Transactions</h1>
        <Button className="gap-1.5" onClick={() => openForm()} size="sm">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nouvelle</span>
        </Button>
      </div>

      {/* Barre de filtres */}
      <TransactionFilters
        accounts={accounts}
        activeCount={activeFilterCount}
        categories={categories}
        onChange={handleFiltersChange}
        value={filters}
      />

      {/* Liste / Skeleton / Vide */}
      {isLoading ? <TransactionListSkeleton /> : renderContent()}
    </div>
  )
}
