"use client"

import {
  LandmarkIcon,
  LayoutDashboard,
  Plus,
  Repeat2,
  Search,
  Settings,
  Target,
  Wallet,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { getTransactions } from "@/lib/actions/transactions"
import { useCurrency } from "@/lib/context/currency-context"
import { useTransactionForm } from "@/lib/context/transaction-form-context"
import { cn } from "@/lib/utils"

type TxResult = Awaited<ReturnType<typeof getTransactions>>["items"][number]

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", Icon: Repeat2 },
  { href: "/accounts", label: "Comptes", Icon: LandmarkIcon },
  { href: "/budgets", label: "Budgets", Icon: Wallet },
  { href: "/goals", label: "Objectifs", Icon: Target },
  { href: "/settings", label: "Paramètres", Icon: Settings },
]

interface GlobalSearchProps {
  onOpenChange: (open: boolean) => void
  open: boolean
}

function formatAmount(amount: number, type: string, currency: string) {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
  if (type === "INCOME") return `+${formatted}`
  if (type === "EXPENSE") return `-${formatted}`
  return formatted
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date))
}

function amountColor(type: string) {
  if (type === "INCOME") return "text-[color:var(--color-income)]"
  if (type === "EXPENSE") return "text-[color:var(--color-expense)]"
  return "text-[color:var(--color-transfer)]"
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter()
  const { currency } = useCurrency()
  const { openForm } = useTransactionForm()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TxResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await getTransactions({ search: q })
      setResults(data.items.slice(0, 5))
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleQueryChange(q: string) {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 300)
  }

  function navigate(href: string) {
    onOpenChange(false)
    router.push(href)
  }

  function handleSelectResult() {
    navigate(`/transactions?search=${encodeURIComponent(query)}`)
  }

  function handleNewTransaction() {
    onOpenChange(false)
    openForm()
  }

  const hasResults = results.length > 0
  const showEmpty = Boolean(query) && !loading && !hasResults

  return (
    <CommandDialog
      description="Rechercher des transactions ou naviguer dans l'application"
      onOpenChange={onOpenChange}
      open={open}
      title="Recherche globale"
    >
      <CommandInput
        onValueChange={handleQueryChange}
        placeholder="Rechercher…"
        value={query}
      />
      <CommandList>
        {showEmpty ? (
          <CommandEmpty>Aucun résultat pour « {query} »</CommandEmpty>
        ) : null}

        {hasResults ? (
          <>
            <CommandGroup heading="Transactions">
              {results.map((tx) => (
                <CommandItem
                  key={tx.id}
                  onSelect={handleSelectResult}
                  value={tx.id}
                >
                  <span className="min-w-0 flex-1 truncate">{tx.title}</span>
                  <span className="shrink-0 text-muted-foreground text-xs">
                    {formatDate(tx.date)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-medium text-xs tabular-nums",
                      amountColor(tx.type)
                    )}
                  >
                    {formatAmount(tx.amount, tx.type, currency)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={handleSelectResult}
                value={`voir-tous-${query}`}
              >
                <Search className="size-4 text-muted-foreground" />
                <span>
                  Voir tous les résultats pour{" "}
                  <span className="font-medium">« {query} »</span>
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}

        {!query ? (
          <>
            <CommandGroup heading="Navigation">
              {NAV_ITEMS.map(({ href, label, Icon }) => (
                <CommandItem
                  key={href}
                  onSelect={() => navigate(href)}
                  value={label}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions rapides">
              <CommandItem
                onSelect={handleNewTransaction}
                value="nouvelle transaction"
              >
                <Plus className="size-4 text-muted-foreground" />
                Nouvelle transaction
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  )
}
