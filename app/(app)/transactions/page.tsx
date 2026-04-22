import { headers } from "next/headers"
import { Suspense } from "react"
import { getAccounts } from "@/lib/actions/accounts"
import { getCategoriesForUser } from "@/lib/actions/categories"
import { getTransactions } from "@/lib/actions/transactions"
import { auth } from "@/lib/auth"
import { TransactionListSkeleton } from "./_components/transaction-skeletons"
import { TransactionsClient } from "./_components/transactions-client"

export default async function TransactionsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id ?? ""

  const [initialData, accounts, categories] = await Promise.all([
    userId
      ? getTransactions()
      : Promise.resolve({ items: [], nextCursor: null, hasMore: false }),
    userId ? getAccounts() : Promise.resolve([]),
    userId ? getCategoriesForUser(userId) : Promise.resolve([]),
  ])

  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    color: a.color,
  }))

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type as "EXPENSE" | "INCOME",
  }))

  return (
    <Suspense fallback={<TransactionListSkeleton />}>
      <TransactionsClient
        accounts={accountOptions}
        categories={categoryOptions}
        initialData={initialData}
      />
    </Suspense>
  )
}
