import { Skeleton } from "@/components/ui/skeleton"

export function BudgetCardSkeleton() {
  return (
    <div className="rounded-3xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function BudgetListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {["a", "b", "c", "d", "e", "f"].map((id) => (
        <BudgetCardSkeleton key={id} />
      ))}
    </div>
  )
}
