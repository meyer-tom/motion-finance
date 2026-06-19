"use client"

import { motion } from "framer-motion"
import {
  Bug,
  LandmarkIcon,
  LayoutDashboard,
  LogOut,
  Repeat2,
  Target,
  Wallet,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

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
      {/* Spark — éclair stylisé, orienté haut-droite */}
      <path
        d="M21.5 3L7 18.5H15.5L10.5 29L25 13.5H16.5L21.5 3Z"
        fill="white"
      />
      {/* Reflet intérieur subtil pour la profondeur */}
      <path
        d="M19.5 8.5L12.5 18.5H16.5L14 24.5L21.5 16H17.5L19.5 8.5Z"
        fill="white"
        opacity="0.18"
      />
    </svg>
  )
}

/* ── Logo section ──────────────────────────────────────────────────────────── */

function SidebarLogo() {
  return (
    <Link
      className="flex h-16 items-center gap-3 border-border border-b px-4"
      href="/dashboard"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-violet-700 shadow-sm">
        <BarChartSvg size={20} />
      </div>
      <span className="font-bold text-base text-foreground tracking-[-0.02em]">
        Motion <span className="text-primary">Finance</span>
      </span>
    </Link>
  )
}

/* ── Nav items ─────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/accounts", label: "Comptes", icon: LandmarkIcon },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
] as const

/* ── User avatar ───────────────────────────────────────────────────────────── */

interface UserAvatarProps {
  readonly size?: "sm" | "md" | "lg"
  readonly user: User | null
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?"
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Utilisateur"
  let dim = "h-8 w-8 text-xs"
  let px = 32
  if (size === "sm") {
    dim = "h-7 w-7 text-[10px]"
    px = 28
  } else if (size === "lg") {
    dim = "h-10 w-10 text-sm"
    px = 40
  }

  if (user?.image) {
    return (
      <Image
        alt={displayName}
        className={cn("rounded-full object-cover", dim)}
        height={px}
        src={user.image}
        width={px}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-700 font-semibold text-primary-foreground",
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

const SIDEBAR_SPRING = { type: "spring" as const, stiffness: 500, damping: 40 }

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
    <aside className="sidebar-animate hidden min-h-svh w-56 shrink-0 flex-col border-border border-r bg-card md:flex">
      <SidebarLogo />

      <nav className="flex-1 px-3 py-4">
        <p className="section-title mb-2 px-2">Navigation</p>
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-3 rounded-lg px-3 font-medium text-sm transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                  )}
                  href={href}
                >
                  {isActive ? (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      layoutId="sidebar-active"
                      transition={SIDEBAR_SPRING}
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      "relative z-10 size-4.5 shrink-0",
                      isActive && "stroke-[2.5]"
                    )}
                  />
                  <span className="relative z-10">{label}</span>
                  {isActive ? (
                    <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-border border-t p-3">
        <Link
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-elevated"
          href="/settings"
        >
          <UserAvatar user={user} />
          <div className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate font-semibold text-foreground text-sm">
              {displayName}
            </span>
            <span className="truncate text-muted-foreground text-xs">
              {user?.email ?? ""}
            </span>
          </div>
        </Link>

        <div className="mt-1 flex items-center gap-1">
          <a
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-muted-foreground text-xs transition-colors hover:bg-surface-elevated hover:text-foreground"
            href="https://github.com/anthropics/motion-finance/issues/new"
            rel="noopener"
            target="_blank"
          >
            <Bug className="size-3.5" />
            Signaler un bug
          </a>
          <button
            aria-label="Déconnexion"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
