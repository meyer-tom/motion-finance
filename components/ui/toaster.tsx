"use client"

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { type ToastItem, subscribeToast } from "@/lib/toast"
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
      exit={{ x: 48, opacity: 0, transition: { duration: 0.2 } }}
      initial={{ x: 48, opacity: 0 }}
      layout
      transition={SPRING}
    >
      <div className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-xl shadow-black/8 dark:shadow-black/30">
        <div
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
            bgClass
          )}
        >
          <Icon className={cn("size-5", iconClass)} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-snug text-foreground">
            {item.title}
          </p>
          {item.description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>

        <button
          aria-label="Fermer"
          className="mt-0.5 shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => onDismiss(item.id)}
          type="button"
        >
          <X className="size-3.5" />
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
      className="pointer-events-none fixed right-4 bottom-24 z-50 flex w-80 flex-col-reverse gap-2 md:bottom-6 md:right-6"
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
