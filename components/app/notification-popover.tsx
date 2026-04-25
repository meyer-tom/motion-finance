"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/actions/notifications"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"

/* ── Types ──────────────────────────────────────────────────────────────── */

type Notification = Awaited<ReturnType<typeof getNotifications>>[number]
type NotificationType = Notification["type"]

/* ── Constantes ─────────────────────────────────────────────────────────── */

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; iconClass: string; bgClass: string; barClass: string }
> = {
  WARNING: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    barClass: "bg-amber-500",
  },
  DANGER: {
    icon: AlertCircle,
    iconClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    barClass: "bg-rose-500",
  },
  SUCCESS: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    barClass: "bg-emerald-500",
  },
  INFO: {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    barClass: "bg-blue-500",
  },
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function relativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

/* ── Sous-composants ────────────────────────────────────────────────────── */

function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 font-semibold text-[10px] text-white leading-none">
      {count > 9 ? "9+" : count}
    </span>
  )
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { icon: Icon, iconClass, bgClass, barClass } = TYPE_CONFIG[notification.type]
  const unread = !notification.isRead

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        unread && "bg-muted/30"
      )}
    >
      {/* Barre colorée gauche pour non-lues */}
      {unread && (
        <div
          className={cn(
            "absolute top-3 bottom-3 left-0 w-0.5 rounded-r-full",
            barClass
          )}
        />
      )}

      {/* Icône */}
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          bgClass
        )}
      >
        <Icon className={cn("size-4", iconClass)} />
      </div>

      {/* Contenu cliquable */}
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => {
          if (unread) onMarkRead(notification.id)
        }}
        type="button"
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              unread ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
            {relativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
          {notification.body}
        </p>
      </button>

      {/* Bouton supprimer — toujours visible mobile, hover sur desktop */}
      <button
        aria-label="Supprimer"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100"
        onClick={() => onDelete(notification.id)}
        type="button"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Bell className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-sm">Vous êtes à jour</p>
        <p className="mt-0.5 text-muted-foreground text-xs">
          Aucune notification pour le moment.
        </p>
      </div>
    </div>
  )
}

function HeaderActions({
  hasUnread,
  hasNotifications,
  onMarkAll,
  onDeleteAll,
}: {
  hasUnread: boolean
  hasNotifications: boolean
  onMarkAll: () => void
  onDeleteAll: () => void
}) {
  if (!hasUnread && !hasNotifications) return null

  return (
    <div className="flex items-center gap-3">
      {hasUnread && (
        <button
          className="text-muted-foreground text-xs transition-colors hover:text-foreground"
          onClick={onMarkAll}
          type="button"
        >
          Tout lire
        </button>
      )}
      {hasNotifications && (
        <button
          className="text-rose-500 text-xs transition-colors hover:text-rose-600 dark:hover:text-rose-400"
          onClick={onDeleteAll}
          type="button"
        >
          Tout supprimer
        </button>
      )}
    </div>
  )
}

/* ── Composant principal ────────────────────────────────────────────────── */

export function NotificationPopover() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    staleTime: 30_000,
  })

  /* Mutations avec mise à jour optimiste du cache */

  const { mutate: markAll } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () =>
      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] = []) => old.map((n) => ({ ...n, isRead: true }))
      ),
  })

  const { mutate: markOne } = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (id) =>
      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] = []) =>
          old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      ),
  })

  const { mutate: deleteOne } = useMutation({
    mutationFn: deleteNotification,
    onMutate: (id) =>
      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] = []) => old.filter((n) => n.id !== id)
      ),
  })

  const { mutate: deleteAll } = useMutation({
    mutationFn: deleteAllNotifications,
    onMutate: () =>
      queryClient.setQueryData(["notifications"], [] as Notification[]),
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) void refetch()
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const hasUnread = unreadCount > 0
  const hasNotifications = notifications.length > 0

  /* ── Contenu de la liste (partagé mobile / desktop) ── */

  const list =
    notifications.length === 0 ? (
      <EmptyState />
    ) : (
      notifications.map((n, i) => (
        <div key={n.id}>
          <NotificationItem
            notification={n}
            onDelete={(id) => deleteOne(id)}
            onMarkRead={(id) => markOne(id)}
          />
          {i < notifications.length - 1 && <Separator />}
        </div>
      ))
    )

  /* ── Mobile — BottomSheet ── */

  if (isMobile) {
    return (
      <>
        <Button
          aria-label="Notifications"
          className="relative"
          onClick={() => setOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Bell className="h-[18px] w-[18px]" />
          <NotificationBadge count={unreadCount} />
        </Button>

        <BottomSheet
          onOpenChange={handleOpenChange}
          open={open}
          title="Notifications"
        >
          <div className="flex flex-col gap-4 pb-2">
            <HeaderActions
              hasNotifications={hasNotifications}
              hasUnread={hasUnread}
              onDeleteAll={() => deleteAll()}
              onMarkAll={() => markAll()}
            />
            <div className="-mx-6">
              <Separator />
              {list}
            </div>
          </div>
        </BottomSheet>
      </>
    )
  }

  /* ── Desktop — Popover ── */

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Notifications"
          className="relative"
          size="icon"
          variant="ghost"
        >
          <Bell className="h-[18px] w-[18px]" />
          <NotificationBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] gap-0 p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-sm">Notifications</span>
          <HeaderActions
            hasNotifications={hasNotifications}
            hasUnread={hasUnread}
            onDeleteAll={() => deleteAll()}
            onMarkAll={() => markAll()}
          />
        </div>

        <Separator />

        <div className="max-h-[420px] overflow-y-auto">{list}</div>
      </PopoverContent>
    </Popover>
  )
}
