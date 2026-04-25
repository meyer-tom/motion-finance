"use client"

import { LogOut, Search, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { BarChartSvg, UserAvatar } from "@/components/app/sidebar"
import { NotificationPopover } from "@/components/app/notification-popover"
import { ThemeToggle } from "@/components/app/theme-toggle"
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
  "/accounts": "Comptes",
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
    <header className="header-animate sticky top-0 z-40 flex h-14 items-center gap-2 border-sidebar-border border-b bg-sidebar px-3 lg:px-4">
      {/* Mobile : icône logo + titre de la page courante */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-violet-600/20 bg-white shadow-sm dark:border-indigo-500/20 dark:bg-[#0f0f1a]">
          <BarChartSvg size={16} />
        </div>
        <h1 className="font-semibold text-base tracking-tight">{title}</h1>
      </div>

      {/* Desktop : titre de la page */}
      <h1 className="hidden font-semibold text-base md:block">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Recherche — desktop uniquement */}
        <button
          className="hidden h-9 w-60 items-center justify-between rounded-lg border border-border bg-background/60 px-3 text-muted-foreground text-sm transition-colors hover:bg-background md:flex"
          type="button"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span>Recherche rapide…</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-muted px-1 font-medium text-[11px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationPopover />

        {/* Thème */}
        <ThemeToggle />

        {/* Avatar + menu — mobile uniquement */}
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
            <div className="px-3 py-2">
              <p className="font-medium text-sm">{displayName}</p>
              <p className="truncate text-muted-foreground text-xs">
                {user?.email ?? ""}
              </p>
            </div>
            <DropdownMenuSeparator />
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
      </div>
    </header>
  )
}
