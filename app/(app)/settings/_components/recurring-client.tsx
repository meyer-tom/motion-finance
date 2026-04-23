"use client"

import { Plus } from "lucide-react"
import { useState, useTransition } from "react"
import type {
  RecurringAccountOption,
  RecurringCategoryOption,
  RecurringEditValues,
} from "@/components/recurring/recurring-form-sheet"
import { RecurringFormSheet } from "@/components/recurring/recurring-form-sheet"
import type { RecurringItemData } from "@/components/recurring/recurring-item"
import { RecurringItem } from "@/components/recurring/recurring-item"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteRecurring } from "@/lib/actions/recurring-transactions"

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface RecurringClientProps {
  accounts: RecurringAccountOption[]
  categories: RecurringCategoryOption[]
  items: RecurringItemData[]
}

/* ── Composant principal ────────────────────────────────────────────────────── */

export function RecurringClient({
  accounts,
  categories,
  items,
}: RecurringClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editValues, setEditValues] = useState<RecurringEditValues | undefined>(
    undefined
  )
  const [deleteTarget, setDeleteTarget] = useState<string | undefined>(
    undefined
  )
  const [isPending, startTransition] = useTransition()

  function handleEdit(item: RecurringItemData) {
    setEditValues({
      id: item.id,
      name: item.name,
      type: item.type,
      amount: item.amount,
      description: item.description,
      categoryId: item.categoryId,
      accountId: item.accountId,
      toAccountId: item.toAccountId,
      frequency: item.frequency,
    })
    setSheetOpen(true)
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open)
    if (!open) {
      setEditValues(undefined)
    }
  }

  // Déclenché depuis le bouton delete dans le form sheet
  function handleDeleteRequest() {
    if (!editValues?.id) {
      return
    }
    setDeleteTarget(editValues.id)
    setSheetOpen(false)
  }

  // Déclenché depuis le dropdown desktop
  function handleDeleteFromItem(item: RecurringItemData) {
    setDeleteTarget(item.id)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }
    startTransition(async () => {
      await deleteRecurring(deleteTarget)
      setDeleteTarget(undefined)
      setEditValues(undefined)
    })
  }

  const targetName = items.find((i) => i.id === deleteTarget)?.name

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-base">
              Transactions récurrentes
            </h2>
            <p className="text-muted-foreground text-sm">
              {items.length === 0
                ? "Aucune transaction récurrente."
                : `${items.length} modèle${items.length > 1 ? "s" : ""} configuré${items.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditValues(undefined)
              setSheetOpen(true)
            }}
            size="sm"
          >
            <Plus className="size-4" />
            Nouvelle
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="divide-y overflow-hidden rounded-xl border">
            {items.map((item) => (
              <RecurringItem
                item={item}
                key={item.id}
                onDelete={handleDeleteFromItem}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              Créez des modèles pour le loyer, les abonnements, le salaire… Ils
              serviront de suggestions lors de l'ajout de transactions.
            </p>
            <Button
              onClick={() => {
                setEditValues(undefined)
                setSheetOpen(true)
              }}
              variant="outline"
            >
              <Plus className="size-4" />
              Créer un modèle
            </Button>
          </div>
        )}
      </section>

      <RecurringFormSheet
        accounts={accounts}
        categories={categories}
        initialValues={editValues}
        onDelete={handleDeleteRequest}
        onOpenChange={handleSheetOpenChange}
        open={sheetOpen}
      />

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(undefined)
          }
        }}
        open={Boolean(deleteTarget)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {targetName} » ?</DialogTitle>
            <DialogDescription>
              Ce modèle sera définitivement supprimé. Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => setDeleteTarget(undefined)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button
              disabled={isPending}
              onClick={handleConfirmDelete}
              variant="destructive"
            >
              {isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
