"use client"

import {
  LandmarkIcon,
  LayoutDashboard,
  LogOut,
  Repeat2,
  Settings,
  Target,
  Wallet,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { User } from "@/lib/auth"
import { authClient } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

/* ── Logo SVG ──────────────────────────────────────────────────────────────── */

export function BarChartSvg({ size }: { readonly size: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <rect
        className="fill-[#6d28d9] dark:fill-[#8b7cf8]"
        height="10"
        rx="1.5"
        width="4"
        x="5"
        y="18"
      />
      <rect
        className="fill-[#7c3aed] dark:fill-[#a78bfa]"
        height="18"
        rx="1.5"
        width="4"
        x="11"
        y="10"
      />
      <rect
        className="fill-[#6d28d9] dark:fill-[#8b7cf8]"
        height="14"
        rx="1.5"
        width="4"
        x="17"
        y="14"
      />
      <rect
        className="fill-[#8b5cf6] dark:fill-[#c4b5fd]"
        height="22"
        rx="1.5"
        width="4"
        x="23"
        y="6"
      />
    </svg>
  )
}

/* ── Navigation items ──────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/accounts", label: "Comptes", icon: LandmarkIcon },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
  { href: "/settings", label: "Paramètres", icon: Settings },
]

/* ── User avatar ───────────────────────────────────────────────────────────── */

interface UserAvatarProps {
  readonly size?: "sm" | "md"
  readonly user: User | null
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?"
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Utilisateur"
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs"

  if (user?.image) {
    return (
      <Image
        alt={displayName}
        className={cn("rounded-full object-cover", dim)}
        height={size === "sm" ? 28 : 32}
        src={user.image}
        width={size === "sm" ? 28 : 32}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        dim
      )}
    >
      {initials}
    </span>
  )
}

/* ── AppSidebar ────────────────────────────────────────────────────────────── */

interface AppSidebarProps {
  readonly user: User | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Utilisateur"

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar
      className="sticky top-0 hidden h-svh shrink-0 border-sidebar-border border-r md:flex"
      collapsible="none"
    >
      {/* Logo */}
      <SidebarHeader className="p-0">
        <div className="flex h-14 items-center gap-3 border-sidebar-border border-b px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-600/20 bg-white shadow-sm dark:border-indigo-500/20 dark:bg-[#0f0f1a]">
            <BarChartSvg size={22} />
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-[-0.04em] dark:text-white">
            Motion{" "}
            <span className="text-violet-700 dark:text-violet-400">Finance</span>
          </span>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 pt-4">
        <SidebarMenu className="gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`)
            return (
              <SidebarMenuItem key={href}>
                <Link
                  className={cn(
                    "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-foreground/60 hover:bg-primary/10 hover:text-primary"
                  )}
                  href={href}
                >
                  <Icon
                    className={cn(
                      "size-[18px]",
                      isActive ? "stroke-[2.5]" : "stroke-[1.75]"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer — utilisateur */}
      <SidebarFooter className="border-sidebar-border border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <UserAvatar user={user} />
          <div className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate font-semibold text-sm">{displayName}</span>
            <span className="truncate text-muted-foreground text-xs">
              {user?.email ?? ""}
            </span>
          </div>
          <button
            aria-label="Déconnexion"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
            title="Déconnexion"
            type="button"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
