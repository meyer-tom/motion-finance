"use client"

import { createContext, useContext, useState } from "react"

interface CurrencyContextValue {
  currency: string
  setCurrency: (currency: string) => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency: string
  children: React.ReactNode
}) {
  const [currency, setCurrency] = useState(initialCurrency)

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error("useCurrency doit être utilisé dans un CurrencyProvider")
  }
  return ctx
}
