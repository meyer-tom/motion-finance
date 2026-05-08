import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  DollarSign,
  Home,
  Landmark,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react"

export const ACCOUNT_ICON_MAP: Record<string, LucideIcon> = {
  Wallet,
  CreditCard,
  PiggyBank,
  Building2,
  Home,
  ShoppingCart,
  Car,
  Briefcase,
  Landmark,
  TrendingUp,
  DollarSign,
  Banknote,
}

export function getAccountIcon(key: string): LucideIcon {
  return ACCOUNT_ICON_MAP[key] ?? Wallet
}
