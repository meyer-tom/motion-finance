import { prisma } from "../lib/db"

async function main() {
  console.log("🌱 Seeding database...")

  // TODO: Ajouter les seeds ici (catégories système, utilisateurs de test, etc.)

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
