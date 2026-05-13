"use client"

import { useSearchParams } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { TransactionInput } from "@/lib/validations/transaction"

export interface TransactionFormInitialValues
  extends Partial<TransactionInput> {
  id?: string // présent en mode édition
}

interface TransactionFormContextValue {
  closeForm: () => void
  guideActive: boolean
  initialValues: TransactionFormInitialValues | undefined
  open: boolean
  openForm: (values?: TransactionFormInitialValues, withGuide?: boolean) => void
}

const TransactionFormContext = createContext<
  TransactionFormContextValue | undefined
>(undefined)

export function TransactionFormProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [guideActive, setGuideActive] = useState(false)
  const [initialValues, setInitialValues] = useState<
    TransactionFormInitialValues | undefined
  >(undefined)

  const searchParams = useSearchParams()

  // PWA shortcut : ?action=add-transaction
  useEffect(() => {
    if (searchParams.get("action") === "add-transaction") {
      setInitialValues(undefined)
      setOpen(true)
    }
  }, [searchParams])

  const openForm = useCallback(
    (values?: TransactionFormInitialValues, withGuide?: boolean) => {
      setInitialValues(values)
      setGuideActive(withGuide ?? false)
      setOpen(true)
    },
    []
  )

  const closeForm = useCallback(() => {
    setOpen(false)
    setGuideActive(false)
  }, [])

  return (
    <TransactionFormContext
      value={{ open, guideActive, initialValues, openForm, closeForm }}
    >
      {children}
    </TransactionFormContext>
  )
}

export function useTransactionForm() {
  const ctx = useContext(TransactionFormContext)
  if (!ctx) {
    throw new Error(
      "useTransactionForm doit être utilisé dans un TransactionFormProvider"
    )
  }
  return ctx
}
