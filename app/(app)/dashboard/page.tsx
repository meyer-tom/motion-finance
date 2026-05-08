import { Suspense } from "react"
import { getDashboardData } from "@/lib/actions/dashboard"
import { AlertsSection } from "./_components/alerts-section"
import { BalanceSection } from "./_components/balance-section"
import { ChartsSection } from "./_components/charts-section"
import { GoalsSection } from "./_components/goals-section"
import { PeriodSelector } from "./_components/period-selector"
import { QuickAddButton } from "./_components/quick-add-button"
import { RecentTransactionsSection } from "./_components/recent-transactions-section"
import {
  AlertsSkeleton,
  BalanceSkeleton,
  ChartsSkeleton,
  GoalsSkeleton,
  RecentTransactionsSkeleton,
  StatsSkeleton,
  TransfersSkeleton,
} from "./_components/skeletons"
import { StatsSection } from "./_components/stats-section"
import { TransfersSection } from "./_components/transfers-section"

async function TransfersSectionWrapper({ periodKey }: { periodKey: string }) {
  const data = await getDashboardData(periodKey)
  return <TransfersSection periodKey={periodKey} transfers={data.transfers} />
}

interface Props {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const sp = await searchParams
  const rawPeriod = sp.period ?? "month"

  const periodKey =
    rawPeriod === "custom" && sp.from && sp.to
      ? `custom:${sp.from}:${sp.to}`
      : rawPeriod

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-2 md:justify-between">
        <div className="flex flex-1 items-center gap-2 md:flex-none">
          <Suspense
            fallback={
              <div className="h-9 flex-1 animate-pulse rounded-xl bg-muted md:w-64 md:flex-none" />
            }
          >
            <PeriodSelector periodKey={periodKey} />
          </Suspense>
          <QuickAddButton />
        </div>
      </div>

      {/* Bloc solde */}
      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceSection periodKey={periodKey} />
      </Suspense>

      {/* Stats revenus / dépenses / net */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection periodKey={periodKey} />
      </Suspense>

      {/* Ligne 2 : Graphiques */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection periodKey={periodKey} />
      </Suspense>

      {/* Ligne 3 : grille 2 colonnes
           Ligne A : Transactions | Budgets
           Ligne B : Virements    | Objectifs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<RecentTransactionsSkeleton />}>
          <RecentTransactionsSection periodKey={periodKey} />
        </Suspense>

        <Suspense fallback={<AlertsSkeleton />}>
          <AlertsSection periodKey={periodKey} />
        </Suspense>

        <Suspense fallback={<TransfersSkeleton />}>
          <TransfersSectionWrapper periodKey={periodKey} />
        </Suspense>

        <Suspense fallback={<GoalsSkeleton />}>
          <GoalsSection periodKey={periodKey} />
        </Suspense>
      </div>
    </div>
  )
}
