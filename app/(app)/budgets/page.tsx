import { Suspense } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getBudgetsWithSpending } from "@/lib/actions/budgets"
import { getCategoriesForUser } from "@/lib/actions/categories"
import { BudgetListSkeleton } from "./_components/budget-skeletons"
import { BudgetsClient } from "./_components/budgets-client"

export default async function BudgetsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id ?? ""

  const now = new Date()
  const initialMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )

  const [initialData, allCategories] = await Promise.all([
    userId ? getBudgetsWithSpending(initialMonth) : Promise.resolve([]),
    userId ? getCategoriesForUser(userId) : Promise.resolve([]),
  ])

  const expenseCategories = allCategories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
    }))

  return (
    <Suspense fallback={<BudgetListSkeleton />}>
      <BudgetsClient
        categories={expenseCategories}
        initialData={initialData}
        initialMonth={initialMonth}
      />
    </Suspense>
  )
}
