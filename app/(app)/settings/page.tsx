import { Suspense } from "react"
import { getAccounts } from "@/lib/actions/accounts"
import { getSettingsCategories } from "@/lib/actions/categories"
import { getChecklistState } from "@/lib/actions/onboarding"
import { getRecurringTransactions } from "@/lib/actions/recurring-transactions"
import { getAuthSession } from "@/lib/auth/session"
import { prisma } from "@/lib/db"
import { SettingsTabs } from "./_components/settings-tabs"

export default async function SettingsPage() {
  const session = await getAuthSession()
  const userId = session!.user.id

  const [
    { systemCategories, userCategories },
    recurringItems,
    accounts,
    userRecord,
    checklistState,
  ] = await Promise.all([
    getSettingsCategories(),
    getRecurringTransactions(),
    getAccounts(),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        name: true,
        currency: true,
      },
    }),
    getChecklistState(),
  ])

  const user = userRecord ?? {
    firstName: session!.user.firstName ?? "",
    lastName: session!.user.lastName ?? "",
    email: session!.user.email,
    image: session!.user.image,
    name: session!.user.name,
    currency: "EUR",
  }

  const serializeCategory = (cat: {
    id: string
    name: string
    type: string
    color: string
    icon: string
    isHidden: boolean
    isSystem: boolean
  }) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type as "EXPENSE" | "INCOME",
    color: cat.color,
    icon: cat.icon,
    isHidden: cat.isHidden,
    isSystem: cat.isSystem,
  })

  const formCategories = [
    ...systemCategories
      .filter((c) => !c.isHidden)
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type as "EXPENSE" | "INCOME",
        color: c.color,
        icon: c.icon,
      })),
    ...userCategories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as "EXPENSE" | "INCOME",
      color: c.color,
      icon: c.icon,
    })),
  ]

  const formAccounts = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    color: a.color,
    icon: a.icon,
  }))

  return (
    <div className="mx-auto max-w-2xl pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="font-bold text-xl tracking-tight">Paramètres</h1>
        <p className="mt-0.5 text-muted-foreground text-sm">
          Gérez votre profil, préférences et données
        </p>
      </div>
      <Suspense>
        <SettingsTabs
          accounts={formAccounts}
          checklistCompleted={checklistState.checklistCompleted}
          checklistDismissed={checklistState.checklistDismissed}
          currency={user.currency}
          formCategories={formCategories}
          recurringItems={recurringItems}
          systemCategories={systemCategories.map(serializeCategory)}
          tooltipsSeen={checklistState.tooltipsSeen}
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            image: user.image,
            name: user.name,
          }}
          userCategories={userCategories.map(serializeCategory)}
        />
      </Suspense>
    </div>
  )
}
