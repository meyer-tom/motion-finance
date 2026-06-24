import { Suspense } from "react"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getServerCurrency } from "@/lib/actions/settings"
import { getAuthSession } from "@/lib/auth/session"
import { AlertsSection } from "./_components/alerts-section"
import { BalanceSection } from "./_components/balance-section"
import { ChartsSection } from "./_components/charts-section"
import { GoalsSection } from "./_components/goals-section"
import { OnboardingChecklistSection } from "./_components/onboarding-checklist-section"
import { PeriodSelector } from "./_components/period-selector"
import { QuickAddButton } from "./_components/quick-add-button"
import { RecentTransactionsSection } from "./_components/recent-transactions-section"
import {
  AlertsSkeleton,
  BalanceSkeleton,
  ChartsSkeleton,
  ChecklistSkeleton,
  GoalsSkeleton,
  RecentTransactionsSkeleton,
  SpendingPowerSkeleton,
  StatsSkeleton,
  TransfersSkeleton,
} from "./_components/skeletons"
import { SpendingPowerSection } from "./_components/spending-power-section"
import { StatsSection } from "./_components/stats-section"
import { TransfersSection } from "./_components/transfers-section"

async function TransfersSectionWrapper({ periodKey }: { periodKey: string }) {
  const [data, currency] = await Promise.all([
    getDashboardData(periodKey),
    getServerCurrency(),
  ])
  return (
    <TransfersSection
      currency={currency}
      periodKey={periodKey}
      transfers={data.transfers}
    />
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) {
    return "Bonjour"
  }
  if (hour < 18) {
    return "Bon après-midi"
  }
  return "Bonsoir"
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

  const session = await getAuthSession()
  const firstName = session?.user?.firstName ?? ""
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  return (
    <div className="space-y-5">
      {/* Header: salutation + contrôles période */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-black text-3xl tracking-tight md:text-4xl">
            {getGreeting()}
            {firstName ? (
              <>
                , <span className="text-primary">{firstName}</span>
              </>
            ) : null}{" "}
            !
          </h1>
          <p className="mt-1 text-muted-foreground text-sm capitalize">
            {dateLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Suspense
            fallback={
              <div className="h-9 w-44 animate-pulse rounded-xl bg-muted" />
            }
          >
            <PeriodSelector periodKey={periodKey} />
          </Suspense>
          <QuickAddButton />
        </div>
      </div>

      {/* Checklist d'onboarding */}
      <Suspense fallback={<ChecklistSkeleton />}>
        <OnboardingChecklistSection />
      </Suspense>

      {/* Solde total — pleine largeur */}
      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceSection periodKey={periodKey} />
      </Suspense>

      {/* Vue rapide — comptes courants + charges prévues */}
      <Suspense fallback={<SpendingPowerSkeleton />}>
        <SpendingPowerSection periodKey={periodKey} />
      </Suspense>

      {/* Revenus / Dépenses / Net */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection periodKey={periodKey} />
        </Suspense>
      </div>

      {/* Graphiques */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection periodKey={periodKey} />
      </Suspense>

      {/* Transactions récentes + Budgets (50/50, items-start) */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <Suspense fallback={<RecentTransactionsSkeleton />}>
          <RecentTransactionsSection periodKey={periodKey} />
        </Suspense>
        <Suspense fallback={<AlertsSkeleton />}>
          <AlertsSection periodKey={periodKey} />
        </Suspense>
      </div>

      {/* Virements + Objectifs d'épargne */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
