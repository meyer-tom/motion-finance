import { Skeleton } from "@/components/ui/skeleton"

function TransactionItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16 shrink-0" />
    </div>
  )
}

function TransactionGroupSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2">
        <Skeleton className="h-3 w-20" />
        <div className="h-px flex-1 bg-border" />
      </div>
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items statiques
        <TransactionItemSkeleton key={i} />
      ))}
    </div>
  )
}

export function TransactionListSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      <TransactionGroupSkeleton count={4} />
      <TransactionGroupSkeleton count={3} />
      <TransactionGroupSkeleton count={4} />
    </div>
  )
}

export function TransactionLoadMoreSkeleton() {
  return (
    <div className="py-2">
      <TransactionGroupSkeleton count={3} />
    </div>
  )
}
