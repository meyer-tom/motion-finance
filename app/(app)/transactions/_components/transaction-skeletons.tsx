import { Skeleton } from "@/components/ui/skeleton"

const SKELETONS_4 = ["a", "b", "c", "d"] as const
const SKELETONS_3 = ["a", "b", "c"] as const

function TransactionItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-5">
      <Skeleton className="size-12 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16 shrink-0" />
    </div>
  )
}

function TransactionGroupSkeleton({ count = 4 }: { count?: 3 | 4 }) {
  const ids = count === 3 ? SKELETONS_3 : SKELETONS_4

  return (
    <div className="flex flex-col gap-2">
      <div className="px-1">
        <Skeleton className="h-3 w-28" />
      </div>
      {ids.map((id) => (
        <TransactionItemSkeleton key={id} />
      ))}
    </div>
  )
}

export function TransactionListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <TransactionGroupSkeleton count={4} />
      <TransactionGroupSkeleton count={3} />
      <TransactionGroupSkeleton count={4} />
    </div>
  )
}

export function TransactionLoadMoreSkeleton() {
  return <TransactionGroupSkeleton count={3} />
}
