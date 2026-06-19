"use client"

import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { subscribeToast, type ToastItem } from "@/lib/toast"
import { cn } from "@/lib/utils"

const SPRING = { type: "spring" as const, stiffness: 500, damping: 42 }

const VARIANT_CONFIG: Record<
  ToastItem["variant"],
  { icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-(--color-income)",
    bgClass: "bg-(--color-income)/12",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-(--color-expense)",
    bgClass: "bg-(--color-expense)/12",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-orange-500",
    bgClass: "bg-orange-500/12",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/12",
  },
}

function Toast({
  item,
  onDismiss,
}: Readonly<{ item: ToastItem; onDismiss: (id: string) => void }>) {
  const { icon: Icon, iconClass, bgClass } = VARIANT_CONFIG[item.variant]

  useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), item.duration)
    return () => clearTimeout(t)
  }, [item.id, item.duration, onDismiss])

  return (
    <motion.div
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0, transition: { duration: 0.18 } }}
      initial={{ x: 40, opacity: 0 }}
      layout
      transition={SPRING}
    >
      <div className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 shadow-black/6 shadow-lg dark:shadow-black/25">
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-lg",
            bgClass
          )}
        >
          <Icon className={cn("size-3.5", iconClass)} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm leading-snug">
            {item.title}
          </p>
          {item.description ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {item.description}
            </p>
          ) : null}
        </div>

        <button
          aria-label="Fermer"
          className="shrink-0 rounded-md p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
          onClick={() => onDismiss(item.id)}
          type="button"
        >
          <X className="size-3" />
        </button>
      </div>
    </motion.div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    return subscribeToast((item) => {
      setToasts((prev) => [...prev, item])
    })
  }, [])

  return (
    <div
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-24 z-50 flex w-72 flex-col-reverse gap-2 md:right-6 md:bottom-6"
      role="status"
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((item) => (
          <div className="pointer-events-auto" key={item.id}>
            <Toast item={item} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
