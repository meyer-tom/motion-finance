import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  EXPENSE: "Dépense",
  INCOME: "Revenu",
  TRANSFER: "Virement",
}

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR")
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: {
      category: { select: { name: true } },
      account: { select: { name: true } },
      toAccount: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  })

  const csvRows: string[] = []

  csvRows.push(
    [
      "Date",
      "Type",
      "Montant",
      "Catégorie",
      "Compte",
      "Vers",
      "Description",
      "Tags",
    ]
      .map(escapeCsvValue)
      .join(",")
  )

  for (const tx of transactions) {
    csvRows.push(
      [
        formatDate(tx.date),
        TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type,
        tx.amount.toFixed(2).replace(".", ","),
        tx.category?.name ?? "",
        tx.account.name,
        tx.toAccount?.name ?? "",
        tx.title,
        tx.tags.join("; "),
      ]
        .map(escapeCsvValue)
        .join(",")
    )
  }

  // BOM UTF-8 pour compatibilité Excel
  const bom = "﻿"
  const csv = bom + csvRows.join("\n")

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="transactions-motion.csv"',
    },
  })
}
