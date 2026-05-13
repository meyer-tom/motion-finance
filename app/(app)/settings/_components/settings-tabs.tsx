"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { DiscoveryTooltip } from "@/components/app/discovery-tooltip"
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
import { markChecklistStepCurrent } from "@/lib/actions/onboarding"
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
  checklistCompleted: string[]
  checklistDismissed: boolean
  currency: string
  formCategories: RecurringCategoryOption[]
  recurringItems: RecurringItemData[]
  systemCategories: Category[]
  tooltipsSeen: string[]
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
  checklistCompleted,
  checklistDismissed,
  tooltipsSeen,
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
      {/* Navigation — Select mobile + Sliding pill desktop */}
      <DiscoveryTooltip
        align="center"
        checklistCompleted={checklistCompleted}
        checklistDismissed={checklistDismissed}
        checklistStep="profile"
        onComplete={() => {
          markChecklistStepCurrent("profile")
        }}
        steps={[
          {
            description:
              "Votre profil est configuré lors de l'inscription. Vous pouvez y modifier votre photo.",
            onEnter: () => handleTabChange("profil"),
            title: "Profil",
          },
          {
            description:
              "Choisissez votre devise principale (EUR, USD, GBP...) et votre thème visuel.",
            onEnter: () => handleTabChange("preferences"),
            title: "Préférences",
          },
          {
            description:
              "Créez vos propres catégories et configurez des transactions récurrentes.",
            onEnter: () => handleTabChange("categories"),
            title: "Catégories",
          },
          {
            description:
              "Exportez vos transactions en CSV ou supprimez définitivement votre compte.",
            onEnter: () => handleTabChange("donnees"),
            title: "Données",
          },
        ]}
        tooltipsSeen={tooltipsSeen}
      >
        <div className="flex flex-col gap-4">
          <div className="sm:hidden">
            <Select
              onValueChange={(v) => handleTabChange(v as Tab)}
              value={activeTab}
            >
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

          <div className="relative hidden rounded-xl bg-muted p-1 sm:flex">
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
        </div>
      </DiscoveryTooltip>

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
