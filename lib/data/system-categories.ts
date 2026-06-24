import type { CategoryType } from "@prisma/client"

export const SYSTEM_CATEGORIES: Array<{
  name: string
  icon: string
  color: string
  type: CategoryType
  isSystem: true
  userId: null
  isHidden: false
}> = [
  // Dépenses
  { name: "Alimentation", icon: "ShoppingCart", color: "#10b981", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Restaurants & Cafés", icon: "UtensilsCrossed", color: "#f59e0b", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Transport", icon: "Car", color: "#3b82f6", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Logement", icon: "Home", color: "#8b5cf6", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Santé", icon: "Heart", color: "#ef4444", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Loisirs", icon: "Gamepad2", color: "#ec4899", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Shopping", icon: "ShoppingBag", color: "#a855f7", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Abonnements", icon: "RefreshCw", color: "#14b8a6", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Éducation", icon: "GraduationCap", color: "#6366f1", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Sport", icon: "Dumbbell", color: "#f97316", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Voyages", icon: "Plane", color: "#06b6d4", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Cadeaux", icon: "Gift", color: "#f43f5e", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  { name: "Divers", icon: "MoreHorizontal", color: "#64748b", type: "EXPENSE", isSystem: true, userId: null, isHidden: false },
  // Revenus
  { name: "Salaire", icon: "Briefcase", color: "#10b981", type: "INCOME", isSystem: true, userId: null, isHidden: false },
  { name: "Freelance", icon: "Laptop", color: "#3b82f6", type: "INCOME", isSystem: true, userId: null, isHidden: false },
  { name: "Remboursement", icon: "RotateCcw", color: "#6366f1", type: "INCOME", isSystem: true, userId: null, isHidden: false },
  { name: "Investissements", icon: "TrendingUp", color: "#f59e0b", type: "INCOME", isSystem: true, userId: null, isHidden: false },
  { name: "Autres revenus", icon: "PlusCircle", color: "#64748b", type: "INCOME", isSystem: true, userId: null, isHidden: false },
]
