import {
  ArrowDownIcon,
  ArrowRightLeftIcon,
  ArrowUpIcon,
  CreditCardIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonText,
} from "@/components/ui/skeleton"
import {
  AreaChartDemo,
  BarChartDemo,
  PieChartDemo,
} from "./_components/demo-charts-wrapper"
import { DemoOverlays } from "./_components/demo-overlays"
import {
  DemoAnimatedAmount,
  DemoAnimatedProgress,
  DemoBottomSheet,
  DemoGoalCompletion,
} from "./_components/demo-shared"

function Section({
  title,
  children,
}: {
  readonly title: string
  readonly children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b pb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function UiDemoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <h1 className="font-bold font-heading text-2xl">UI Components</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Motion Finance — aperçu des composants shadcn/ui
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">XSmall</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <WalletIcon />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="ghost">Ghost</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="income">
              <ArrowUpIcon />
              Revenu
            </Badge>
            <Badge variant="expense">
              <ArrowDownIcon />
              Dépense
            </Badge>
            <Badge variant="transfer">
              <ArrowRightLeftIcon />
              Virement
            </Badge>
            <Badge variant="success">Complété</Badge>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Solde total</CardDescription>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                    <WalletIcon className="size-4 text-primary" />
                  </div>
                </div>
                <CardTitle className="font-bold text-2xl">8 420 €</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="income">
                  <TrendingUpIcon />
                  +12% ce mois
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Revenus</CardDescription>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-(--color-income)/10">
                    <ArrowUpIcon className="size-4 text-(--color-income)" />
                  </div>
                </div>
                <CardTitle className="text-(--color-income) text-xl">
                  +4 500 €
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  Salaire + freelance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>Dépenses</CardDescription>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-(--color-expense)/10">
                    <CreditCardIcon className="size-4 text-(--color-expense)" />
                  </div>
                </div>
                <CardTitle className="text-(--color-expense) text-xl">
                  −2 700 €
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">5 catégories</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Graphiques */}
        <Section title="Graphiques — Recharts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenus vs Dépenses</CardTitle>
                  <CardDescription>6 derniers mois</CardDescription>
                </div>
                <div className="flex gap-3 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-(--color-income)" /> Revenus
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-(--color-expense)" /> Dépenses
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BarChartDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évolution du solde</CardTitle>
              <CardDescription>Cumul sur 6 mois</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChartDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des dépenses</CardTitle>
              <CardDescription>Par catégorie — avril</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartDemo />
            </CardContent>
          </Card>
        </Section>

        {/* Progress */}
        <Section title="Progress — Budgets">
          <Card>
            <CardHeader>
              <CardTitle>Budgets du mois</CardTitle>
              <CardDescription>3 catégories actives</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {[
                {
                  label: "Alimentation",
                  pct: 87,
                  color: "var(--color-expense)",
                },
                { label: "Transport", pct: 62, color: "oklch(0.78 0.16 65)" },
                { label: "Loisirs", pct: 34, color: "var(--color-income)" },
              ].map(({ label, pct, color }) => (
                <div className="flex flex-col gap-2" key={label}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="tabular-nums" style={{ color }}>
                      {pct}%
                    </span>
                  </div>
                  <Progress
                    style={{ "--progress-color": color } as React.CSSProperties}
                    value={pct}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                  <PiggyBankIcon className="size-5 text-(--color-accent)" />
                </div>
                <div className="flex-1">
                  <CardTitle>Vacances 2025</CardTitle>
                  <CardDescription>1 950 € sur 3 000 €</CardDescription>
                </div>
                <Badge
                  className="border-accent/30 text-(--color-accent)"
                  variant="outline"
                >
                  65%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress
                style={
                  {
                    "--progress-color": "var(--color-accent)",
                  } as React.CSSProperties
                }
                value={65}
              />
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button size="sm" variant="ghost">
                Modifier
              </Button>
              <Button size="sm">Ajouter un versement</Button>
            </CardFooter>
          </Card>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <div className="flex flex-col gap-3">
            <Input placeholder="Description de la transaction" />
            <Input placeholder="Montant (€)" type="number" />
            <Input placeholder="Rechercher..." type="search" />
            <Input disabled placeholder="Désactivé" />
          </div>
        </Section>

        {/* AnimatedAmount */}
        <Section title="AnimatedAmount">
          <DemoAnimatedAmount />
        </Section>

        {/* Skeleton */}
        <Section title="Skeleton">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-muted-foreground text-xs">
                SkeletonText (1 ligne)
              </p>
              <SkeletonText />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-muted-foreground text-xs">
                SkeletonText (3 lignes)
              </p>
              <SkeletonText lines={3} />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-muted-foreground text-xs">
                SkeletonCard
              </p>
              <SkeletonCard />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium text-muted-foreground text-xs">
                SkeletonAvatar + SkeletonText
              </p>
              <div className="flex items-center gap-3">
                <SkeletonAvatar />
                <div className="flex-1">
                  <SkeletonText lines={2} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2">
              <p className="font-medium text-muted-foreground text-xs">
                Skeleton brut (taille libre)
              </p>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </Section>

        {/* AnimatedProgress */}
        <Section title="AnimatedProgress">
          <DemoAnimatedProgress />
        </Section>

        {/* BottomSheet */}
        <Section title="BottomSheet">
          <DemoBottomSheet />
        </Section>

        {/* Overlays — Client Component */}
        <Section title="Dialog · Sheet · Popover · Dropdown">
          <DemoOverlays />
        </Section>

        {/* GoalCompletionCelebration */}
        <Section title="GoalCompletionCelebration">
          <DemoGoalCompletion />
        </Section>
      </div>
    </div>
  )
}
