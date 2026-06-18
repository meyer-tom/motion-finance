"use client"

import { motion } from "framer-motion"
import {
  LandmarkIcon,
  LayoutDashboard,
  LogOut,
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
import { useEffect, useRef, useState } from "react"

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
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null)

  const activeIndex = NAV_ITEMS.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  )

  useEffect(() => {
    if (activeIndex < 0) return
    const tab = tabRefs.current[activeIndex]
    if (!tab) return
    setPill({ x: tab.offsetLeft, width: tab.offsetWidth })
  }, [activeIndex, pathname])

  return (
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-2 md:flex">
      {pill ? (
        <motion.span
          animate={{ x: pill.x, width: pill.width }}
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-0 rounded-full bg-primary shadow-md shadow-primary/30"
          initial={false}
          transition={PILL_SPRING}
        />
      ) : null}
      {NAV_ITEMS.map(({ href, label }, i) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative z-10 rounded-full px-5 py-2 font-semibold text-sm transition-colors duration-200",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            href={href}
            key={href}
          >
            {label}
          </Link>
        )
      })}
    </nav>
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
                <Search className="h-4.5 w-4.5" />
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

            {/* Mobile: bulle actions (même style desktop) */}
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-2.5 py-2.5 md:hidden">
              <button
                aria-label="Recherche"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-all hover:text-foreground hover:shadow-md"
                onClick={() => setSearchOpen(true)}
                type="button"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <NotificationPopover />
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
                <DropdownMenuContent align="end" className="w-52">
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
          </div>
        </div>
      </header>

      <GlobalSearch onOpenChange={setSearchOpen} open={searchOpen} />
    </>
  )
}
