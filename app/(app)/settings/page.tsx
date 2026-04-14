import { getSettingsCategories } from "@/lib/actions/categories"
import { CategoriesClient } from "./_components/categories-client"

export default async function SettingsPage() {
  const { systemCategories, userCategories } = await getSettingsCategories()

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
    </div>
  )
}
