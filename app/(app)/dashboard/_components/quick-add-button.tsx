"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransactionForm } from "@/lib/context/transaction-form-context"

export function QuickAddButton() {
  const { openForm } = useTransactionForm()

  return (
    <Button
      className="hidden h-11 gap-2 rounded-full px-5 md:flex"
      onClick={() => openForm()}
      type="button"
    >
      <Plus className="size-4" strokeWidth={2.5} />
      Nouvelle transaction
    </Button>
  )
}
