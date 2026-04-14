"use client"

import { Bell, LogOut, Search, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { BarChartSvg, UserAvatar } from "@/components/app/sidebar"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/lib/auth"
import { authClient } from "@/lib/auth/client"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/goals": "Objectifs",
  "/settings": "Paramètres",
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname]
  }
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(`${key}/`)) {
      return title
    }
  }
  return "Motion Finance"
}

interface HeaderProps {
  readonly user: User | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const title = getPageTitle(pathname)
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Utilisateur"

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="header-animate sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 lg:px-4">
      {/* Logo + nom — mobile uniquement */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-violet-600/30 bg-white shadow-sm dark:border-indigo-500/30 dark:bg-[#0f0f1a]">
          <BarChartSvg size={18} />
        </div>
        <span className="font-extrabold text-lg tracking-[-0.04em]">
          <span className="text-slate-900 dark:text-white">Motion </span>
          <span className="text-violet-700 dark:text-violet-400">
            Finance
          </span>
        </span>
      </div>

      <h1 className="hidden font-semibold text-base md:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Search — desktop uniquement */}
        <button
          className="hidden h-9 w-64 items-center justify-between rounded-lg border border-border bg-background px-3 text-muted-foreground text-sm transition-colors hover:bg-background/80 md:flex"
          type="button"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span>Recherche rapide…</span>
          </span>
          <div className="flex items-center gap-0.5">
            <kbd className="pointer-events-none inline-flex h-6 items-center rounded border border-border bg-background px-1.5 font-medium text-sm">
              ⌘
            </kbd>
            <kbd className="pointer-events-none inline-flex h-6 items-center rounded border border-border bg-background px-1.5 font-medium font-mono text-xs">
              K
            </kbd>
          </div>
        </button>

        <Button aria-label="Notifications" size="icon" variant="ghost">
          <Bell className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        {/* Avatar — mobile uniquement */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={displayName}
              className="flex items-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              type="button"
            >
              <UserAvatar size="sm" user={user} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 font-medium text-sm">{displayName}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings">
                <Settings className="h-4 w-4" />
                Paramètres
              </a>
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
      </div>
    </header>
  )
}
