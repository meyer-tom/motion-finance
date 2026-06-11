import { Skeleton } from "@/components/ui/skeleton"

const SKELETON_IDS = ["sk-1", "sk-2", "sk-3"]

function GoalCardSkeleton() {
  return (
    <div className="space-y-3 rounded-3xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-10 w-full rounded-3xl" />
    </div>
  )
}

export function GoalListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SKELETON_IDS.map((id) => (
        <GoalCardSkeleton key={id} />
      ))}
    </div>
  )
}
