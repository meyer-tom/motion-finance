import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      data-slot="skeleton"
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.ComponentProps<"div"> & { lines?: number }) {
  if (lines === 1) {
    return <Skeleton className={cn("h-4 w-full", className)} {...props} />
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => {
        const isLast = i === lines - 1
        return (
          <Skeleton
            className={cn("h-4", isLast ? "w-3/4" : "w-full")}
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton lines are static placeholders, never reordered
            key={i}
          />
        )
      })}
    </div>
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton className={cn("h-32 w-full rounded-xl", className)} {...props} />
  )
}

function SkeletonAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton className={cn("size-10 rounded-full", className)} {...props} />
  )
}

export { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText }
