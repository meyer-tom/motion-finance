import { Skeleton } from "@/components/ui/skeleton"

export function ChecklistSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
      <div className="space-y-0.5 px-5 py-3">
        <Skeleton className="mb-3 h-1.5 w-full rounded-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="flex items-center gap-2.5 px-1 py-2" key={i}>
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-3.5" style={{ width: `${60 + i * 8}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BalanceSkeleton() {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card">
      <div className="px-5 pt-6 pb-5">
        <Skeleton className="mb-3 h-3 w-20" />
        <Skeleton className="h-12 w-48" />
        <div className="mt-6 space-y-2 border-border/50 border-t pt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="flex items-center gap-2.5 px-2 py-2" key={i}>
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-5 md:px-5"
          key={i}
        >
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-2.5 w-14" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </>
  )
}

export function ChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-card md:col-span-2">
        <div className="border-border/60 border-b px-5 py-3.5">
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="px-5 pt-4 pb-5">
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-border/60 border-b px-5 py-3.5">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="px-5 pt-4 pb-5">
          <Skeleton className="mx-auto h-40 w-40 rounded-full" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="flex items-center gap-2" key={i}>
                <Skeleton className="size-3 shrink-0 rounded-full" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TransfersSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-3 px-5 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="flex items-center justify-between gap-3" key={i}>
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-3 w-12 shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function RecentTransactionsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="divide-y divide-border/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="flex items-center gap-3 px-5 py-3.5" key={i}>
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GoalsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="space-y-5 px-5 py-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div className="space-y-2" key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AlertsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="space-y-4 px-5 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="space-y-2" key={i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-3.5 shrink-0 rounded" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
