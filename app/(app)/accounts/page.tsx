import { getAccounts } from "@/lib/actions/accounts"
import { AccountsClient } from "./_components/accounts-client"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  const serialized = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    color: a.color,
    icon: a.icon,
    balance: a.balance,
  }))

  return (
    <div className="flex flex-col gap-4">
      <AccountsClient accounts={serialized} />
    </div>
  )
}
