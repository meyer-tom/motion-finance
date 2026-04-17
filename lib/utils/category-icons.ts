import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Coffee,
  Dumbbell,
  Film,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Laptop,
  MoreHorizontal,
  Music,
  Phone,
  Plane,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react"

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Home,
  Heart,
  Gamepad2,
  ShoppingBag,
  RefreshCw,
  GraduationCap,
  Dumbbell,
  Plane,
  Gift,
  Briefcase,
  Laptop,
  RotateCcw,
  TrendingUp,
  PlusCircle,
  MoreHorizontal,
  Coffee,
  Music,
  Film,
  Globe,
  Star,
  Tag,
  Zap,
  Wallet,
  Building2,
  BookOpen,
  Headphones,
  Phone,
}

export const CATEGORY_ICONS = Object.entries(CATEGORY_ICON_MAP).map(
  ([key, component]) => ({ key, component })
)

/** Retourne le composant Lucide correspondant à une clé, ou Tag par défaut. */
export function getCategoryIcon(key: string): LucideIcon {
  return CATEGORY_ICON_MAP[key] ?? Tag
}
