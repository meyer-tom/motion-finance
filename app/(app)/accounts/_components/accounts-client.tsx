"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { AccountCard } from "@/components/accounts/account-card"
import type { AccountEditValues } from "@/components/accounts/account-form-modal"
import { AccountFormModal } from "@/components/accounts/account-form-modal"
import { DiscoveryTooltip } from "@/components/app/discovery-tooltip"
import { AnimatedAmount } from "@/components/shared/animated-amount"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { reorderAccounts } from "@/lib/actions/accounts"
import { useCurrency } from "@/lib/context/currency-context"
import { formatAmount } from "@/lib/utils/format"

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
  className,
  onEdit,
  totalBalance,
}: {
  account: Account
  className?: string
  onEdit: (values: AccountEditValues) => void
  totalBalance: number
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
    <div className={className} ref={setNodeRef} style={style} {...attributes}>
      <AccountCard
        account={account}
        dragListeners={
          listeners as Record<string, React.EventHandler<React.SyntheticEvent>>
        }
        isDragging={isDragging}
        onEdit={onEdit}
        totalBalance={totalBalance}
      />
    </div>
  )
}

/* ── Section comptes ───────────────────────────────────────────────────────── */

const CONTAINER_CLASS =
  "flex flex-col gap-3 sm:flex-row sm:overflow-x-auto sm:pb-1 sm:snap-x sm:snap-mandatory"
const CARD_CLASS = "sm:w-75 sm:shrink-0 sm:snap-start"

function AccountSection({
  accounts,
  dotClass,
  label,
  onEdit,
  onDragEnd,
  subtotal,
  totalBalance,
  currency,
}: {
  accounts: Account[]
  dotClass: string
  label: string
  onEdit: (values: AccountEditValues) => void
  onDragEnd: (event: DragEndEvent) => void
  subtotal: number
  totalBalance: number
  currency: string
}) {
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const boundsModifier: Modifier = useCallback(
    ({ transform, draggingNodeRect }) => {
      if (!(containerRef.current && draggingNodeRect)) {
        return isMobile ? { ...transform, x: 0 } : { ...transform, y: 0 }
      }
      const rect = containerRef.current.getBoundingClientRect()
      if (isMobile) {
        return {
          ...transform,
          x: 0,
          y: Math.max(
            rect.top - draggingNodeRect.top,
            Math.min(rect.bottom - draggingNodeRect.bottom, transform.y)
          ),
        }
      }
      return {
        ...transform,
        y: 0,
        x: Math.max(
          rect.left - draggingNodeRect.left,
          Math.min(rect.right - draggingNodeRect.right, transform.x)
        ),
      }
    },
    [isMobile]
  )

  if (accounts.length === 0) {
    return null
  }

  const sectionHeader = (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`inline-block size-2 shrink-0 rounded-full ${dotClass}`}
      />
      <span className="section-title">{label}</span>
      <span className="rounded-full border border-border/60 bg-muted px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground tabular-nums">
        {accounts.length}
      </span>
      <div className="h-px flex-1 bg-border/40" />
      <span className="font-mono font-semibold text-[12px] text-muted-foreground tabular-nums">
        {formatAmount(subtotal, currency)}
      </span>
    </div>
  )

  if (accounts.length === 1) {
    return (
      <div className="flex flex-col gap-3">
        {sectionHeader}
        <div className={CONTAINER_CLASS}>
          <div className={CARD_CLASS}>
            <AccountCard
              account={accounts[0]}
              onEdit={onEdit}
              totalBalance={totalBalance}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sectionHeader}
      <DndContext
        collisionDetection={closestCenter}
        id={`dnd-${label}`}
        modifiers={[boundsModifier]}
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={accounts.map((a) => a.id)}
          strategy={
            isMobile
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          <div className={CONTAINER_CLASS} ref={containerRef}>
            {accounts.map((account) => (
              <SortableAccountCard
                account={account}
                className={CARD_CLASS}
                key={account.id}
                onEdit={onEdit}
                totalBalance={totalBalance}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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
  const { currency } = useCurrency()

  useEffect(() => {
    setAccounts(initialAccounts)
  }, [initialAccounts])

  const checkingAccounts = accounts.filter((a) => a.type === "CHECKING")
  const savingsAccounts = accounts.filter((a) => a.type === "SAVINGS")
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  const checkingTotal = checkingAccounts.reduce((sum, a) => sum + a.balance, 0)
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0)

  function handleDragEndChecking(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const oldIdx = checkingAccounts.findIndex((a) => a.id === active.id)
    const newIdx = checkingAccounts.findIndex((a) => a.id === over.id)
    const reordered = [
      ...arrayMove(checkingAccounts, oldIdx, newIdx),
      ...savingsAccounts,
    ]
    setAccounts(reordered)
    startTransition(async () => {
      await reorderAccounts(reordered.map((a) => a.id))
    })
  }

  function handleDragEndSavings(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const oldIdx = savingsAccounts.findIndex((a) => a.id === active.id)
    const newIdx = savingsAccounts.findIndex((a) => a.id === over.id)
    const reordered = [
      ...checkingAccounts,
      ...arrayMove(savingsAccounts, oldIdx, newIdx),
    ]
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
      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
          {accounts.length === 0 ? (
            <p className="mt-0.5 text-muted-foreground text-sm">
              Aucun compte pour le moment.
            </p>
          ) : null}
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
            className="btn-gradient-primary h-11 gap-2 rounded-full px-5 font-semibold shadow-md"
            onClick={() => {
              setEditValues(undefined)
              setModalOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nouveau compte
          </Button>
        </DiscoveryTooltip>
      </div>

      {accounts.length > 0 ? (
        <>
          {/* ── Summary banner ────────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex flex-col divide-y divide-border/40 sm:flex-row sm:divide-x sm:divide-y-0">
              {/* Total */}
              <div className="flex flex-col justify-center px-6 py-5 sm:min-w-[200px] md:min-w-[240px]">
                <p className="section-title mb-2">Solde total</p>
                <AnimatedAmount
                  className="font-black text-3xl text-gradient-balance leading-none tracking-tight"
                  currency={currency}
                  value={totalBalance}
                  variant="neutral"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {accounts.length} compte{accounts.length === 1 ? "" : "s"}
                </p>
              </div>

              {/* Courants */}
              <div className="flex flex-1 flex-col justify-center px-6 py-5">
                <div className="mb-2 flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="inline-block size-2 shrink-0 rounded-full bg-amber-400"
                  />
                  <p className="section-title">Courants</p>
                </div>
                {checkingAccounts.length > 0 ? (
                  <>
                    <AnimatedAmount
                      className="font-bold text-xl leading-none tracking-tight"
                      currency={currency}
                      value={checkingTotal}
                      variant="neutral"
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {checkingAccounts.length} compte
                      {checkingAccounts.length === 1 ? "" : "s"}
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-muted-foreground">
                    Aucun compte courant
                  </p>
                )}
              </div>

              {/* Épargne */}
              <div className="flex flex-1 flex-col justify-center px-6 py-5">
                <div className="mb-2 flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="inline-block size-2 shrink-0 rounded-full bg-[var(--color-transfer)]"
                  />
                  <p className="section-title">Épargne</p>
                </div>
                {savingsAccounts.length > 0 ? (
                  <>
                    <AnimatedAmount
                      className="font-bold text-xl leading-none tracking-tight"
                      currency={currency}
                      value={savingsTotal}
                      variant="neutral"
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {savingsAccounts.length} compte
                      {savingsAccounts.length === 1 ? "" : "s"}
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-muted-foreground">
                    Aucun compte épargne
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Sections par type ──────────────────────────────────────────── */}
          <AccountSection
            accounts={checkingAccounts}
            currency={currency}
            dotClass="bg-amber-400"
            label="Comptes courants"
            onDragEnd={handleDragEndChecking}
            onEdit={handleEdit}
            subtotal={checkingTotal}
            totalBalance={totalBalance}
          />

          <AccountSection
            accounts={savingsAccounts}
            currency={currency}
            dotClass="bg-[var(--color-transfer)]"
            label="Comptes épargne"
            onDragEnd={handleDragEndSavings}
            onEdit={handleEdit}
            subtotal={savingsTotal}
            totalBalance={totalBalance}
          />
        </>
      ) : (
        /* ── Empty state ──────────────────────────────────────────────────── */
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-border/50 border-dashed py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
            <Plus className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Aucun compte</p>
            <p className="max-w-xs text-muted-foreground text-sm">
              Créez votre premier compte pour commencer à suivre vos finances.
            </p>
          </div>
          <Button
            className="btn-gradient-primary h-11 gap-2 rounded-full px-5 font-semibold shadow-md"
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
