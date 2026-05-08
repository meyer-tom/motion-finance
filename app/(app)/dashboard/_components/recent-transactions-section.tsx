import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { formatAmount } from "@/lib/utils/format"
import { getAccountIcon } from "@/lib/utils/account-icons"
import { getCategoryIcon } from "@/lib/utils/category-icons"

interface Props {
  periodKey: string
}

const TYPE_SIGN: Record<string, string> = {
  INCOME: "+",
  EXPENSE: "-",
  TRANSFER: "",
}

const TYPE_COLOR: Record<string, string> = {
  INCOME: "var(--color-income)",
  EXPENSE: "var(--color-expense)",
  TRANSFER: "var(--color-transfer)",
}

function formatCurrency(value: number, type: string, currency: string) {
  const sign = TYPE_SIGN[type] ?? ""
  return sign + formatAmount(value, currency)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso))
}

type Tx = Awaited<
  ReturnType<typeof getDashboardData>
>["recentTransactions"][number]

function TxIcon({ tx }: { tx: Tx }) {
  if (tx.category) {
    const IconComp = getCategoryIcon(tx.category.icon)
    return (
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${tx.category.color}20` }}
      >
        <IconComp
          className="size-[18px]"
          style={{ color: tx.category.color }}
        />
      </div>
    )
  }
  const IconComp = getAccountIcon(tx.accountIcon)
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${tx.accountColor}20` }}
    >
      <IconComp className="size-[18px]" style={{ color: tx.accountColor }} />
    </div>
  )
}

export async function RecentTransactionsSection({ periodKey }: Props) {
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])
  const txs = data.recentTransactions

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-semibold text-sm">
          Dernières transactions
        </CardTitle>
        <Link
          className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
          href="/transactions"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {txs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-muted-foreground text-sm">
              Aucune transaction pour le moment
            </p>
            <Link
              className="text-primary text-sm underline-offset-4 hover:underline"
              href="/transactions"
            >
              Ajouter une transaction
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {txs.map((tx) => (
              <li
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                key={tx.id}
              >
                <TxIcon tx={tx} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{tx.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {tx.category?.name ?? tx.accountName} ·{" "}
                    {formatDate(tx.date)}
                  </p>
                </div>

                <span
                  className="shrink-0 font-semibold text-sm tabular-nums"
                  style={{ color: TYPE_COLOR[tx.type] ?? "inherit" }}
                >
                  {formatCurrency(tx.amount, tx.type, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
