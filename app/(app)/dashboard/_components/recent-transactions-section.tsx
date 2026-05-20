import { ArrowRight } from "lucide-react"
import Link from "next/link"
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

type Tx = Awaited<ReturnType<typeof getDashboardData>>["recentTransactions"][number]

function TxIcon({ tx }: { tx: Tx }) {
  if (tx.category) {
    const IconComp = getCategoryIcon(tx.category.icon)
    return (
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${tx.category.color}20` }}
      >
        <IconComp className="size-[18px]" style={{ color: tx.category.color }} />
      </div>
    )
  }
  const IconComp = getAccountIcon(tx.accountIcon)
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
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
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <span className="section-title">Transactions récentes</span>
        <Link
          className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-primary"
          href="/transactions"
        >
          Voir tout
          <ArrowRight className="size-3" />
        </Link>
      </div>
      {txs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <p className="text-muted-foreground text-sm">Aucune transaction sur la période</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {txs.map((tx) => (
            <li
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
              key={tx.id}
            >
              <TxIcon tx={tx} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[13px] leading-tight">
                  {tx.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {tx.category?.name ?? tx.accountName} · {formatDate(tx.date)}
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
    </div>
  )
}
