"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

import { AccountCard } from "@/components/accounts/account-card"
import type { AccountEditValues } from "@/components/accounts/account-form-modal"
import { AccountFormModal } from "@/components/accounts/account-form-modal"
import { Button } from "@/components/ui/button"
import { reorderAccounts } from "@/lib/actions/accounts"

const GRID_COLS = {
  1: "max-w-sm",
  2: "sm:grid-cols-2 max-w-2xl",
  3: "sm:grid-cols-2 lg:grid-cols-3 max-w-4xl",
} as const

interface Account {
  balance: number
  color: string
  icon: string
  id: string
  name: string
  type: "CHECKING" | "SAVINGS"
}

/* ── Carte triable ─────────────────────────────────────────────────────────── */

function SortableAccountCard({
  account,
  onEdit,
}: {
  account: Account
  onEdit: (values: AccountEditValues) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AccountCard
        account={account}
        dragListeners={
          listeners as Record<string, React.EventHandler<React.SyntheticEvent>>
        }
        isDragging={isDragging}
        onEdit={onEdit}
      />
    </div>
  )
}

/* ── Composant principal ───────────────────────────────────────────────────── */

interface AccountsClientProps {
  accounts: Account[]
}

export function AccountsClient({
  accounts: initialAccounts,
}: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [modalOpen, setModalOpen] = useState(false)
  const [editValues, setEditValues] = useState<AccountEditValues | undefined>(
    undefined
  )
  const [, startTransition] = useTransition()

  // Sync avec les nouvelles données serveur (ajout / suppression)
  useEffect(() => {
    setAccounts(initialAccounts)
  }, [initialAccounts])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = accounts.findIndex((a) => a.id === active.id)
    const newIndex = accounts.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(accounts, oldIndex, newIndex)

    setAccounts(reordered)

    startTransition(async () => {
      await reorderAccounts(reordered.map((a) => a.id))
    })
  }

  function handleEdit(values: AccountEditValues) {
    setEditValues(values)
    setModalOpen(true)
  }

  function handleOpenChange(open: boolean) {
    setModalOpen(open)
    if (!open) {
      setEditValues(undefined)
    }
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
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={accounts.map((a) => a.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className={`grid gap-2 ${GRID_COLS[Math.min(accounts.length, 3) as 1 | 2 | 3]}`}
            >
              {accounts.map((account) => (
                <SortableAccountCard
                  account={account}
                  key={account.id}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
