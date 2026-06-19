"use client"

import { LogOut, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { GlobalSearch } from "@/components/app/global-search"
import { NotificationPopover } from "@/components/app/notification-popover"
import { BarChartSvg, UserAvatar } from "@/components/app/sidebar"
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
  const [searchOpen, setSearchOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <header className="header-animate sticky top-0 z-40 flex h-14 items-center gap-2 border-border border-b bg-background/80 px-3 backdrop-blur-lg lg:px-4">
        {/* Logo + titre — mobile uniquement */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-700 shadow-sm">
            <BarChartSvg size={16} />
          </div>
          <span className="font-bold text-foreground text-sm tracking-[-0.02em]">
            {title}
          </span>
        </div>

        <h1 className="hidden font-semibold text-base text-foreground md:block">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          {/* Search trigger — desktop */}
          <button
            className="hidden h-9 w-64 items-center justify-between rounded-lg border border-border bg-card px-3 text-muted-foreground text-sm transition-colors hover:border-border-accent hover:bg-surface-elevated md:flex"
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>Recherche rapide…</span>
            </span>
            <div className="flex items-center gap-0.5">
              <kbd className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-surface-elevated px-1.5 font-medium text-[11px]">
                ⌘
              </kbd>
              <kbd className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-surface-elevated px-1.5 font-medium font-mono text-[11px]">
                K
              </kbd>
            </div>
          </button>

          {/* Search trigger — mobile */}
          <Button
            aria-label="Recherche"
            className="text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setSearchOpen(true)}
            size="icon"
            variant="ghost"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Button>

          {/* Notifications */}
          <NotificationPopover />

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={displayName}
                className="flex items-center rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                type="button"
              >
                <UserAvatar size="sm" user={user} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5">
                <p className="font-semibold text-foreground text-sm">
                  {displayName}
                </p>
                <p className="truncate text-muted-foreground text-xs">
                  {user?.email ?? ""}
                </p>
              </div>
              <DropdownMenuSeparator />
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
      </header>

      <GlobalSearch onOpenChange={setSearchOpen} open={searchOpen} />
    </>
  )
}
