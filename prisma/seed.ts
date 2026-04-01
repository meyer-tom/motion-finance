import { CategoryType } from "@prisma/client"
import { prisma } from "../lib/db"

async function main() {
  console.log("🌱 Seeding database...")

  // Seed des catégories système
  console.log("📂 Creating system categories...")

  const systemCategories = [
    // Catégories Dépenses
    {
      name: "Alimentation",
      icon: "ShoppingCart",
      color: "#10b981",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Restaurants & Cafés",
      icon: "UtensilsCrossed",
      color: "#f59e0b",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Transport",
      icon: "Car",
      color: "#3b82f6",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Logement",
      icon: "Home",
      color: "#8b5cf6",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Santé",
      icon: "Heart",
      color: "#ef4444",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Loisirs",
      icon: "Gamepad2",
      color: "#ec4899",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Shopping",
      icon: "ShoppingBag",
      color: "#a855f7",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Abonnements",
      icon: "RefreshCw",
      color: "#14b8a6",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Éducation",
      icon: "GraduationCap",
      color: "#6366f1",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Sport",
      icon: "Dumbbell",
      color: "#f97316",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Voyages",
      icon: "Plane",
      color: "#06b6d4",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Cadeaux",
      icon: "Gift",
      color: "#f43f5e",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Divers",
      icon: "MoreHorizontal",
      color: "#64748b",
      type: CategoryType.EXPENSE,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    // Catégories Revenus
    {
      name: "Salaire",
      icon: "Briefcase",
      color: "#10b981",
      type: CategoryType.INCOME,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Freelance",
      icon: "Laptop",
      color: "#3b82f6",
      type: CategoryType.INCOME,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Remboursement",
      icon: "RotateCcw",
      color: "#6366f1",
      type: CategoryType.INCOME,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Investissements",
      icon: "TrendingUp",
      color: "#f59e0b",
      type: CategoryType.INCOME,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
    {
      name: "Autres revenus",
      icon: "PlusCircle",
      color: "#64748b",
      type: CategoryType.INCOME,
      isSystem: true,
      userId: null,
      isHidden: false,
    },
  ]

  await prisma.category.createMany({
    data: systemCategories,
    skipDuplicates: true,
  })

  console.log(`✅ Created ${systemCategories.length} system categories`)
  console.log("✅ Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
