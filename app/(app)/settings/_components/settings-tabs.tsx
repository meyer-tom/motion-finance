"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import type {
  RecurringAccountOption,
  RecurringCategoryOption,
} from "@/components/recurring/recurring-form-sheet"
import type { RecurringItemData } from "@/components/recurring/recurring-item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CategoriesClient } from "./categories-client"
import { DataSection } from "./data-section"
import { HelpSection } from "./help-section"
import { PreferencesSection } from "./preferences-section"
import { ProfileSection } from "./profile-section"
import { RecurringClient } from "./recurring-client"

interface Category {
  color: string
  icon: string
  id: string
  isHidden: boolean
  isSystem: boolean
  name: string
  type: "EXPENSE" | "INCOME"
}

interface SettingsTabsProps {
  accounts: RecurringAccountOption[]
  currency: string
  formCategories: RecurringCategoryOption[]
  recurringItems: RecurringItemData[]
  systemCategories: Category[]
  user: {
    firstName: string
    lastName: string
    email: string
    image?: string | null
    name: string
  }
  userCategories: Category[]
}

const TABS = ["profil", "preferences", "categories", "donnees", "aide"] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  profil: "Profil",
  preferences: "Préférences",
  categories: "Catégories",
  donnees: "Données",
  aide: "Aide",
}

function isValidTab(value: string | null): value is Tab {
  return TABS.includes(value as Tab)
}

export function SettingsTabs({
  user,
  currency,
  systemCategories,
  userCategories,
  accounts,
  formCategories,
  recurringItems,
}: SettingsTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab")
  const activeTab: Tab = isValidTab(rawTab) ? rawTab : "profil"
  const tabIndex = TABS.indexOf(activeTab)

  const handleTabChange = useCallback(
    (value: Tab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", value)
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Select — mobile uniquement */}
      <div className="sm:hidden">
        <Select value={activeTab} onValueChange={(v) => handleTabChange(v as Tab)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TABS.map((tab) => (
              <SelectItem key={tab} value={tab}>
                {TAB_LABELS[tab]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sliding pill tab list — desktop uniquement */}
      <div className="relative hidden sm:flex rounded-xl bg-muted p-1">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 rounded-lg bg-background shadow-sm transition-all duration-200"
          style={{
            width: `calc((100% - 8px) / ${TABS.length})`,
            left: `calc(4px + ${tabIndex} * (100% - 8px) / ${TABS.length})`,
          }}
        />
        {TABS.map((tab) => (
          <button
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-lg py-1.5 font-medium text-sm transition-colors duration-150",
              activeTab === tab
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            )}
            key={tab}
            onClick={() => handleTabChange(tab)}
            type="button"
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "profil" && <ProfileSection user={user} />}

      {activeTab === "preferences" && (
        <PreferencesSection initialCurrency={currency} />
      )}

      {activeTab === "categories" && (
        <div className="space-y-8">
          <CategoriesClient
            systemCategories={systemCategories}
            userCategories={userCategories}
          />
          <RecurringClient
            accounts={accounts}
            categories={formCategories}
            items={recurringItems}
          />
        </div>
      )}

      {activeTab === "donnees" && <DataSection />}

      {activeTab === "aide" && <HelpSection />}
    </div>
  )
}
