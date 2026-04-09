import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted", className)}
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
  if (lines <= 1) {
    return <Skeleton className={cn("h-4 w-full", className)} {...props} />
  }
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => `line-${i}`).map((key, i) => (
        <Skeleton
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
          key={key}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("h-32 w-full", className)} {...props} />
}

export { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText }
