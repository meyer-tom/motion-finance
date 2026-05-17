"use client"

import { motion } from "framer-motion"
import {
  LandmarkIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Repeat2,
  Search,
  Settings,
  Sun,
  Target,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"

import { GlobalSearch } from "@/components/app/global-search"
import { NotificationPopover } from "@/components/app/notification-popover"
import { BarChartSvg, UserAvatar } from "@/components/app/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { User } from "@/lib/auth"
import { authClient } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Repeat2 },
  { href: "/accounts", label: "Comptes", icon: LandmarkIcon },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Objectifs", icon: Target },
] as const

const PILL_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 }

const THEMES = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Automatique", icon: Monitor },
] as const

function CenteredTabs() {
  const pathname = usePathname()
  return (
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-2 md:flex">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative rounded-full px-5 py-2 font-semibold text-sm transition-all duration-200",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            href={href}
            key={href}
          >
            {isActive ? (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                layoutId="top-nav-pill"
                transition={PILL_SPRING}
              />
            ) : null}
            <span className="relative z-10">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function MobileMenu({ user }: { readonly user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <button
        aria-label="Menu de navigation"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="w-72 p-0" side="left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center gap-2.5 border-border border-b px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-sm">
                <BarChartSvg size={16} />
              </div>
              <span className="font-bold text-foreground text-sm tracking-[-0.02em]">
                Motion <span className="text-primary">Finance</span>
              </span>
            </div>

            <nav className="flex-1 px-3 py-4">
              <ul className="flex flex-col gap-0.5">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`)
                  return (
                    <li key={href}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-xl px-3 font-medium text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                        )}
                        href={href}
                        onClick={() => setOpen(false)}
                      >
                        <Icon
                          className={cn(
                            "size-[18px] shrink-0",
                            isActive && "stroke-[2.5]"
                          )}
                        />
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-border border-t p-3">
              <Link
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-elevated"
                href="/settings"
                onClick={() => setOpen(false)}
              >
                <UserAvatar user={user} />
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-foreground text-sm">
                    {user
                      ? `${user.firstName} ${user.lastName}`.trim()
                      : "Utilisateur"}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user?.email ?? ""}
                  </span>
                </div>
              </Link>
              <button
                className="mt-1 flex h-9 w-full items-center gap-2 rounded-xl px-3 text-destructive text-sm transition-colors hover:bg-destructive/10"
                onClick={handleSignOut}
                type="button"
              >
                <LogOut className="size-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

interface TopNavProps {
  readonly user: User | null
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Utilisateur"

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-20 max-w-screen-2xl items-center px-5 lg:px-8">
          {/* Left: Logo + name */}
          <Link className="flex shrink-0 items-center gap-3" href="/dashboard">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-md">
              <BarChartSvg size={22} />
            </div>
            <span className="hidden font-extrabold text-foreground text-xl tracking-[-0.03em] md:block">
              Motion <span className="text-primary">Finance</span>
            </span>
          </Link>

          {/* Center: animated tabs */}
          <CenteredTabs />

          {/* Right: actions in oval bubble */}
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop bubble — 3 circles, no separators */}
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-2.5 py-2.5 md:flex">
              {/* Search */}
              <button
                aria-label="Recherche"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-all hover:text-foreground hover:shadow-md"
                onClick={() => setSearchOpen(true)}
                type="button"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              {/* Notifications */}
              <NotificationPopover />

              {/* Profile dropdown with theme */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label={displayName}
                    className="flex items-center rounded-full outline-none ring-2 ring-transparent ring-offset-1 ring-offset-background transition-all focus-visible:ring-ring"
                    type="button"
                  >
                    <UserAvatar size="lg" user={user} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-semibold text-foreground text-sm">
                      {displayName}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {user?.email ?? ""}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <Sun className="h-4 w-4 dark:hidden" />
                      <Moon className="hidden h-4 w-4 dark:block" />
                      Thème
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {THEMES.map(({ value, label, icon: Icon }) => (
                        <DropdownMenuItem
                          className="gap-2"
                          key={value}
                          onClick={() => setTheme(value)}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                          {theme === value && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem asChild>
                    <a href="/settings">
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive [&_svg]:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile: search + hamburger */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                aria-label="Recherche"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setSearchOpen(true)}
                type="button"
              >
                <Search className="h-5 w-5" />
              </button>
              <MobileMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      <GlobalSearch onOpenChange={setSearchOpen} open={searchOpen} />
    </>
  )
}
