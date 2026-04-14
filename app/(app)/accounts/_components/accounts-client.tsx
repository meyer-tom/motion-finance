"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountFormModal } from "@/components/accounts/account-form-modal"
import type { AccountEditValues } from "@/components/accounts/account-form-modal"
import { Button } from "@/components/ui/button"

const GRID_COLS = {
  1: "max-w-sm",
  2: "sm:grid-cols-2 max-w-2xl",
  3: "sm:grid-cols-2 lg:grid-cols-3 max-w-4xl",
} as const

interface Account {
  id: string
  name: string
  type: "CHECKING" | "SAVINGS"
  color: string
  icon: string
  balance: number
}

interface AccountsClientProps {
  accounts: Account[]
}

export function AccountsClient({ accounts }: AccountsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editValues, setEditValues] = useState<AccountEditValues | undefined>(undefined)

  function handleEdit(values: AccountEditValues) {
    setEditValues(values)
    setModalOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setModalOpen(open)
    if (!open) setEditValues(undefined)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl">Mes comptes</h1>
          <p className="text-muted-foreground text-sm">
            {accounts.length === 0
              ? "Aucun compte pour le moment."
              : `${accounts.length} compte${accounts.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditValues(undefined)
            setModalOpen(true)
          }}
          size="sm"
        >
          <Plus className="size-4" />
          Nouveau compte
        </Button>
      </div>

      {accounts.length > 0 ? (
        <div className={`grid gap-2 ${GRID_COLS[Math.min(accounts.length, 3) as 1 | 2 | 3]}`}>
          {accounts.map((account) => (
            <AccountCard account={account} key={account.id} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Créez votre premier compte pour commencer à suivre vos finances.
          </p>
          <Button
            onClick={() => {
              setEditValues(undefined)
              setModalOpen(true)
            }}
            variant="outline"
          >
            <Plus className="size-4" />
            Créer un compte
          </Button>
        </div>
      )}

      <AccountFormModal
        initialValues={editValues}
        onOpenChange={handleOpenChange}
        open={modalOpen}
      />
    </>
  )
}
