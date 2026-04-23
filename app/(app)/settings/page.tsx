import { getAccounts } from "@/lib/actions/accounts"
import { getSettingsCategories } from "@/lib/actions/categories"
import { getRecurringTransactions } from "@/lib/actions/recurring-transactions"
import { CategoriesClient } from "./_components/categories-client"
import { RecurringClient } from "./_components/recurring-client"

export default async function SettingsPage() {
  const [{ systemCategories, userCategories }, recurringItems, accounts] =
    await Promise.all([
      getSettingsCategories(),
      getRecurringTransactions(),
      getAccounts(),
    ])

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

  // Catégories visibles pour le formulaire de récurrentes
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
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-bold text-xl">Paramètres</h1>
        <p className="text-muted-foreground text-sm">
          Gérez vos catégories de dépenses et de revenus.
        </p>
      </div>

      <CategoriesClient
        systemCategories={systemCategories.map(serializeCategory)}
        userCategories={userCategories.map(serializeCategory)}
      />

      <RecurringClient
        accounts={formAccounts}
        categories={formCategories}
        items={recurringItems}
      />
    </div>
  )
}
