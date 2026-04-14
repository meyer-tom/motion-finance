"use client"

import {
  ChevronsUpDown,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
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

/* ── Logo section ──────────────────────────────────────────────────────────── */

function SidebarLogo() {
  return (
    <div className="flex h-14 items-center gap-3 border-sidebar-border border-b px-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-violet-600/30 bg-white shadow-sm dark:border-indigo-500/30 dark:bg-[#0f0f1a]">
        <BarChartSvg size={24} />
      </div>
      <span className="font-extrabold text-2xl text-slate-900 tracking-[-0.04em] dark:text-white">
        Motion{" "}
        <span className="text-violet-700 dark:text-violet-400">Finance</span>
      </span>
    </div>
  )
}

/* ── Nav items ─────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/accounts", label: "Comptes", icon: LandmarkIcon },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
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
    <Sidebar className="hidden min-h-svh md:flex" collapsible="none">
      <SidebarHeader className="p-0">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="pt-3">
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`)
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 rounded-lg [&_svg]:size-5 transition-all duration-150",
                      isActive
                        ? "bg-primary! text-primary-foreground! font-semibold! hover:bg-primary/90! hover:text-primary-foreground! shadow-sm shadow-primary/20"
                        : "hover:bg-primary/8 hover:text-primary"
                    )}
                    isActive={isActive}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon
                        className={cn(isActive ? "stroke-[2.5]" : "stroke-2")}
                      />
                      <span className="text-sm">{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="data-[state=open]:bg-sidebar-accent"
                  size="lg"
                  tooltip={displayName}
                >
                  <UserAvatar user={user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {displayName}
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-48"
                side="top"
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-rose-600 data-highlighted:bg-rose-50 data-highlighted:text-rose-600 dark:text-rose-400 dark:data-highlighted:bg-rose-950/60 dark:data-highlighted:text-rose-400 [&_svg]:text-rose-600 dark:[&_svg]:text-rose-400"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
