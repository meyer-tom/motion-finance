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
import { DiscoveryTooltip } from "@/components/app/discovery-tooltip"
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
  checklistCompleted: string[]
  checklistDismissed: boolean
  tooltipsSeen: string[]
}

export function AccountsClient({
  accounts: initialAccounts,
  checklistCompleted,
  checklistDismissed,
  tooltipsSeen,
}: AccountsClientProps) {
  const showGuide = !(
    checklistDismissed ||
    checklistCompleted.includes("savings") ||
    tooltipsSeen.includes("savings")
  )
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

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-bold text-xl tracking-tight">Mes comptes</h1>
            {accounts.length > 0 ? (
              <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs tabular-nums">
                {accounts.length}
              </span>
            ) : null}
          </div>
          {accounts.length > 0 ? (
            <p className="mt-0.5 font-mono font-semibold tabular-nums text-sm text-muted-foreground">
              {totalBalance.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              € total
            </p>
          ) : (
            <p className="mt-0.5 text-muted-foreground text-sm">
              Aucun compte pour le moment.
            </p>
          )}
        </div>
        <DiscoveryTooltip
          actionLabel="Créer un compte épargne"
          checklistCompleted={checklistCompleted}
          checklistDismissed={checklistDismissed}
          checklistStep="savings"
          description="Cliquez ici, choisissez le type Épargne et renseignez le solde de départ pour créer votre compte."
          onAction={() => {
            setEditValues(undefined)
            setModalOpen(true)
          }}
          title="Compte épargne"
          tooltipsSeen={tooltipsSeen}
        >
          <Button
            className="btn-gradient-primary hover:opacity-90"
            onClick={() => {
              setEditValues(undefined)
              setModalOpen(true)
            }}
            size="sm"
          >
            <Plus className="size-4" />
            Nouveau compte
          </Button>
        </DiscoveryTooltip>
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
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
            <Plus className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground text-sm">Aucun compte</p>
            <p className="text-muted-foreground text-xs">
              Créez votre premier compte pour commencer à suivre vos finances.
            </p>
          </div>
          <Button
            className="btn-gradient-primary hover:opacity-90"
            onClick={() => {
              setEditValues(undefined)
              setModalOpen(true)
            }}
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
        showGuide={showGuide}
      />
    </>
  )
}
