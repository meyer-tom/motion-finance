"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER"

export interface RecurringSuggestionItem {
  account: {
    id: string
    name: string
    color: string
    icon: string
    type: string
  }
  accountId: string
  amount: number
  category: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  categoryId: string | null
  description: string | null
  id: string
  name: string
  toAccount: {
    id: string
    name: string
    color: string
    icon: string
    type: string
  } | null
  toAccountId: string | null
  type: TransactionType
}

const TYPE_META: Record<TransactionType, { color: string; prefix: string }> = {
  EXPENSE: { color: "var(--color-expense)", prefix: "−" },
  INCOME: { color: "var(--color-income)", prefix: "+" },
  TRANSFER: { color: "var(--color-transfer)", prefix: "" },
}

interface RecurringSuggestionsProps {
  isLoading: boolean
  onApply: (suggestion: RecurringSuggestionItem) => void
  suggestions: RecurringSuggestionItem[]
}

export function RecurringSuggestions({
  suggestions,
  onApply,
  isLoading,
}: RecurringSuggestionsProps) {
  if (!isLoading && suggestions.length === 0) {
    return null
  }

  return (
    <div>
      <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Suggestions
      </p>
      <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Skeleton
                className="h-[58px] w-[120px] shrink-0 rounded-xl"
                key={i}
              />
            ))
          : suggestions.map((s) => (
              <SuggestionChip key={s.id} onApply={onApply} suggestion={s} />
            ))}
      </div>
    </div>
  )
}

function SuggestionChip({
  suggestion,
  onApply,
}: {
  suggestion: RecurringSuggestionItem
  onApply: (s: RecurringSuggestionItem) => void
}) {
  const meta = TYPE_META[suggestion.type]

  const formattedAmount = suggestion.amount.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return (
    <button
      className={cn(
        "flex w-[120px] shrink-0 flex-col gap-1 rounded-xl border p-3 transition-all",
        "border-border hover:border-border/80 hover:bg-muted/50"
      )}
      onClick={() => onApply(suggestion)}
      type="button"
    >
      <span className="line-clamp-2 text-left font-medium text-foreground text-xs leading-snug">
        {suggestion.name}
      </span>
      <span
        className="text-left font-semibold text-xs tabular-nums"
        style={{ color: meta.color }}
      >
        {meta.prefix}
        {formattedAmount}&nbsp;€
      </span>
    </button>
  )
}
