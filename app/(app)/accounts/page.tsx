import { getAccounts } from "@/lib/actions/accounts"
import { getChecklistState } from "@/lib/actions/onboarding"
import { AccountsClient } from "./_components/accounts-client"

export default async function AccountsPage() {
  const [accounts, { checklistCompleted, checklistDismissed, tooltipsSeen }] =
    await Promise.all([getAccounts(), getChecklistState()])

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
      <AccountsClient
        accounts={serialized}
        checklistCompleted={checklistCompleted}
        checklistDismissed={checklistDismissed}
        tooltipsSeen={tooltipsSeen}
      />
    </div>
  )
}
