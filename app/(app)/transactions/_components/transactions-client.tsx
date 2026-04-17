"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransactionForm } from "@/lib/context/transaction-form-context"

export function TransactionsClient() {
  const { openForm } = useTransactionForm()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Transactions</h2>
        <Button
          className="hidden gap-1.5 md:flex"
          onClick={() => openForm()}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle transaction
        </Button>
      </div>

      {/* TODO : liste avec infinite scroll (Issue suivante) */}
      <p className="text-center text-muted-foreground text-sm">
        La liste des transactions arrive bientôt.
      </p>
    </div>
  )
}
