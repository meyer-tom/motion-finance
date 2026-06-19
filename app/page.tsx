"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Bell,
  ChartPie,
  CheckCircle2,
  PiggyBank,
  Repeat2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { BarChartSvg } from "@/components/app/sidebar"
import { Button } from "@/components/ui/button"

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/* ── Animation wrappers ──────────────────────────────────────────────────────── */

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  )
}

/* ── Data ────────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "100%", label: "Données privées", sub: "Aucune revente, aucun tracking" },
  { value: "6", label: "Mois d'historique", sub: "Graphiques revenus / dépenses" },
  { value: "PWA", label: "Installable partout", sub: "Mobile, desktop, offline" },
  { value: "0 €", label: "Pour usage perso", sub: "Gratuit en phase 1" },
] as const

const MOCKUP_BARS = [
  { key: "exp-jan", h: 40 }, { key: "exp-fev", h: 65 }, { key: "exp-mar", h: 35 },
  { key: "exp-avr", h: 80 }, { key: "exp-mai", h: 55 }, { key: "exp-jun", h: 72 },
] as const

const MOCKUP_BARS_INCOME = [
  { key: "inc-jan", h: 55 }, { key: "inc-fev", h: 80 }, { key: "inc-mar", h: 48 },
  { key: "inc-avr", h: 95 }, { key: "inc-mai", h: 68 }, { key: "inc-jun", h: 85 },
] as const

const MOCKUP_ANALYTICS_BARS = [
  { key: "a-jan", h: 45 }, { key: "a-fev", h: 72 }, { key: "a-mar", h: 38 },
  { key: "a-avr", h: 88 }, { key: "a-mai", h: 61 }, { key: "a-jun", h: 79 },
] as const

/* ── Nav ─────────────────────────────────────────────────────────────────────── */

function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-blue-600 shadow-md shadow-primary/20">
            <BarChartSvg size={18} />
          </div>
          <span className="font-bold text-base tracking-[-0.02em]">
            Motion <span className="text-primary">Finance</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/login">Connexion</Link>
          </Button>
          <Button
            asChild
            className="btn-gradient-primary gap-1.5 hover:opacity-90"
            size="sm"
          >
            <Link href="/register">
              Commencer
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

/* ── Hero ────────────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob-float absolute top-[-10%] left-[5%] h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-[140px] dark:bg-primary/[0.10]" />
        <div className="blob-float-delayed absolute right-[0%] bottom-[-15%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.06] blur-[140px] dark:bg-violet-600/[0.10]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:px-6 sm:pt-28">
        {/* Badge */}
        <FadeUp className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 font-medium text-muted-foreground text-xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Vos finances, enfin sous contrôle
          </span>
        </FadeUp>

        {/* Title */}
        <FadeUp className="mx-auto mt-5 max-w-4xl text-center" delay={0.07}>
          <h1 className="font-black text-5xl tracking-tighter leading-[0.92] sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-gradient-primary">Maîtrisez</span>
            <br />
            <span className="text-foreground">votre argent.</span>
          </h1>
        </FadeUp>

        {/* Subtitle */}
        <FadeUp className="mx-auto mt-6 max-w-xl text-center" delay={0.14}>
          <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
            Comptes, transactions, budgets et objectifs d'épargne réunis dans
            une application rapide, élégante et installable partout.
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          delay={0.21}
        >
          <Button
            asChild
            className="btn-gradient-primary w-full gap-2 hover:opacity-90 sm:w-auto"
            size="lg"
          >
            <Link href="/register">
              Créer mon compte gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto" size="lg" variant="outline">
            <Link href="/login">Se connecter</Link>
          </Button>
        </FadeUp>

        {/* Trust badges */}
        <FadeUp className="mt-6 flex flex-wrap items-center justify-center gap-5" delay={0.28}>
          {[
            { icon: ShieldCheck, label: "100% privé" },
            { icon: Zap, label: "Installable PWA" },
            { icon: CheckCircle2, label: "Gratuit" },
          ].map(({ icon: Icon, label }) => (
            <span className="flex items-center gap-1.5 text-muted-foreground text-xs" key={label}>
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </span>
          ))}
        </FadeUp>

        {/* Hero mockup */}
        <FadeUp className="mx-auto mt-14 max-w-4xl" delay={0.35}>
          <HeroDashboardMockup />
        </FadeUp>
      </div>
    </section>
  )
}

/* ── Hero dashboard mockup ───────────────────────────────────────────────────── */

function HeroDashboardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[oklch(0.11_0.022_265)] shadow-[0_24px_80px_-16px_oklch(0_0_0/0.5),0_0_0_1px_oklch(1_0_0/0.06)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-border border-b bg-[oklch(0.13_0.024_265)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.18_20)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.14_75)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.18_155)]" />
        <span className="ml-3 rounded-md bg-[oklch(0.17_0.03_265)] px-3 py-0.5 font-mono text-[oklch(0.45_0.02_265)] text-xs">
          motion.finance/dashboard
        </span>
      </div>

      {/* Dashboard content */}
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {/* Balance card — spans 2 cols on sm */}
        <div className="rounded-xl border border-[oklch(0.22_0.04_265)] bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-4 sm:col-span-2">
          <p className="text-[oklch(0.50_0.04_258)] text-xs font-medium uppercase tracking-widest">Solde total</p>
          <p className="mt-1.5 font-black font-mono text-4xl text-white tracking-tight">12 480 €</p>
          <div className="mt-3 flex gap-4">
            <div>
              <p className="text-[oklch(0.45_0.02_265)] text-xs">Revenus</p>
              <p className="font-semibold font-mono text-[var(--color-income)] text-sm">+3 200 €</p>
            </div>
            <div>
              <p className="text-[oklch(0.45_0.02_265)] text-xs">Dépenses</p>
              <p className="font-semibold font-mono text-[var(--color-expense)] text-sm">−1 845 €</p>
            </div>
            <div>
              <p className="text-[oklch(0.45_0.02_265)] text-xs">Net</p>
              <p className="font-semibold font-mono text-white text-sm">+1 355 €</p>
            </div>
          </div>
        </div>

        {/* Savings goal card */}
        <div className="rounded-xl border border-[oklch(0.22_0.04_265)] bg-[oklch(0.13_0.024_265)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[oklch(0.45_0.02_265)] text-xs">Objectif vacances</p>
            <PiggyBank className="size-3.5 text-[var(--color-income)]" />
          </div>
          <p className="mt-2 font-bold font-mono text-white text-xl">1 200 €</p>
          <div className="mt-2 h-1.5 rounded-full bg-[oklch(0.20_0.03_265)]">
            <div className="h-full w-[68%] rounded-full bg-[var(--color-income)]" />
          </div>
          <p className="mt-1 text-[oklch(0.45_0.02_265)] text-xs">68% · 560 € restants</p>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-[oklch(0.22_0.04_265)] bg-[oklch(0.13_0.024_265)] p-3 sm:col-span-2">
          <p className="mb-3 text-[oklch(0.45_0.02_265)] text-xs font-medium">Revenus vs Dépenses — 6 mois</p>
          <div className="flex items-end justify-between gap-1 h-16">
            {MOCKUP_BARS.map(({ key, h }) => (
              <div className="flex flex-1 flex-col items-center gap-0.5" key={key}>
                <div
                  className="w-full rounded-sm bg-linear-to-t from-[var(--color-expense)]/40 to-[var(--color-expense)]"
                  style={{ height: `${h * 0.45}px` }}
                />
              </div>
            ))}
            {MOCKUP_BARS_INCOME.map(({ key, h }) => (
              <div className="flex flex-1 flex-col items-center gap-0.5" key={key}>
                <div
                  className="w-full rounded-sm bg-linear-to-t from-[var(--color-income)]/40 to-[var(--color-income)]"
                  style={{ height: `${h * 0.45}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            <span className="flex items-center gap-1 text-[var(--color-income)] text-xs">
              <span className="h-2 w-2 rounded-sm bg-[var(--color-income)]"></span>
              <span>Revenus</span>
            </span>
            <span className="flex items-center gap-1 text-[var(--color-expense)] text-xs">
              <span className="h-2 w-2 rounded-sm bg-[var(--color-expense)]"></span>
              <span>Dépenses</span>
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-xl border border-[oklch(0.22_0.04_265)] bg-[oklch(0.13_0.024_265)] p-3">
          <p className="mb-2 text-[oklch(0.45_0.02_265)] text-xs font-medium">Récentes</p>
          {[
            { label: "Loyer", amount: "−850 €", color: "text-[var(--color-expense)]", sub: "Logement" },
            { label: "Salaire", amount: "+2 800 €", color: "text-[var(--color-income)]", sub: "Revenus" },
            { label: "Netflix", amount: "−17 €", color: "text-[var(--color-expense)]", sub: "Abonnements" },
          ].map(({ label, amount, color, sub }) => (
            <div className="flex items-center justify-between border-[oklch(0.20_0.03_265)] border-b py-1.5 last:border-0" key={label}>
              <div>
                <p className="text-white text-xs font-medium">{label}</p>
                <p className="text-[oklch(0.40_0.02_265)] text-[10px]">{sub}</p>
              </div>
              <span className={`font-mono font-semibold text-xs ${color}`}>{amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Stats strip ─────────────────────────────────────────────────────────────── */

function StatsSection() {
  return (
    <section className="border-border border-y bg-card/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal
            className="border-border border-r last:border-r-0 px-6 py-8 text-center sm:py-10 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
            delay={i * 0.05}
            key={stat.label}
          >
            <p className="font-black font-mono text-3xl text-gradient-primary sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 font-semibold text-foreground text-sm">{stat.label}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">{stat.sub}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── Features bento ──────────────────────────────────────────────────────────── */

function FeaturesBentoSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-title">Fonctionnalités</p>
        <h2 className="mt-3 font-bold text-3xl tracking-[-0.02em] sm:text-4xl">
          Tout ce qu'il faut, rien de plus.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
          Une application pensée pour l'usage quotidien — rapide, claire, sans friction.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Large card — Transactions */}
        <Reveal className="lg:col-span-2" delay={0.05}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Repeat2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Transactions intelligentes</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Dépenses, revenus, virements avec filtres complets, recherche instantanée et infinite scroll. Suggère automatiquement vos transactions récurrentes.
            </p>
            {/* Mini transaction list mockup */}
            <div className="mt-5 space-y-2 rounded-xl border border-border bg-muted/40 p-3">
              {[
                { label: "Loyer juillet", cat: "Logement", amount: "−850 €", color: "text-[var(--color-expense)]" },
                { label: "Virement Livret A", cat: "Virement", amount: "−300 €", color: "text-[var(--color-transfer)]" },
                { label: "Salaire net", cat: "Revenus", amount: "+2 800 €", color: "text-[var(--color-income)]" },
              ].map(({ label, cat, amount, color }) => (
                <div className="flex items-center justify-between" key={label}>
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">{label[0]}</span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{cat}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-semibold text-xs ${color}`}>{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Budgets */}
        <Reveal delay={0.1}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-income)]/10">
              <ChartPie className="h-5 w-5 text-[var(--color-income)]" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Budgets par catégorie</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Plafonds mensuels avec alertes à 80% et 100%.
            </p>
            {/* Mini budget bars */}
            <div className="mt-5 space-y-2.5">
              {[
                { label: "Alimentation", pct: 72, color: "bg-amber-500" },
                { label: "Transport", pct: 45, color: "bg-[var(--color-income)]" },
                { label: "Loisirs", pct: 93, color: "bg-[var(--color-expense)]" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Objectifs */}
        <Reveal delay={0.08}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <PiggyBank className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Objectifs d'épargne</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Suivi avec calcul automatique du montant mensuel. Confettis à 100%.
            </p>
            {/* Mini goal ring */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted/40 p-3 border border-border">
              <div className="relative h-12 w-12 shrink-0">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" fill="none" r="15.9155" stroke="currentColor" strokeWidth="3" className="text-muted" />
                  <circle
                    cx="18" cy="18" fill="none" r="15.9155"
                    stroke="currentColor" strokeWidth="3"
                    strokeDasharray="68 32"
                    strokeLinecap="round"
                    className="text-violet-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-foreground">68%</span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Vacances Italie</p>
                <p className="text-muted-foreground text-xs">1 200 € / 1 750 €</p>
                <p className="text-violet-500 text-xs">550 € restants</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Comptes */}
        <Reveal delay={0.12}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-transfer)]/10">
              <Wallet className="h-5 w-5 text-[var(--color-transfer)]" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Comptes multiples</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Courant, épargne — soldes calculés dynamiquement depuis les transactions.
            </p>
            <div className="mt-5 space-y-2">
              {[
                { name: "Compte courant", balance: "4 230 €", color: "bg-primary" },
                { name: "Livret A", balance: "8 250 €", color: "bg-[var(--color-income)]" },
              ].map(({ name, balance, color }) => (
                <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 border border-border px-3 py-2" key={name}>
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="flex-1 text-xs text-foreground">{name}</span>
                  <span className="font-mono font-semibold text-xs text-foreground">{balance}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Notifications */}
        <Reveal delay={0.16}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Notifications in-app</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Budget à 80%, objectif atteint, récurrente à échéance — tout au bon moment.
            </p>
          </div>
        </Reveal>

        {/* Analytics */}
        <Reveal className="lg:col-span-2" delay={0.14}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Dashboard analytics</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Solde total, revenus et dépenses mensuels, graphique sur 6 mois, répartition par catégorie et solde prévisionnel.
            </p>
            {/* Mini chart */}
            <div className="mt-5 flex items-end justify-between gap-1 rounded-xl border border-border bg-muted/40 px-4 py-3 h-24">
              {MOCKUP_ANALYTICS_BARS.map(({ key, h }) => (
                <div className="flex flex-1 flex-col items-center gap-1" key={key}>
                  <div
                    className="w-full rounded-sm bg-linear-to-t from-primary/40 to-primary"
                    style={{ height: `${h * 0.58}px` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Données isolées */}
        <Reveal delay={0.2}>
          <div className="surface-card-interactive h-full p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="mt-4 font-semibold text-base">Données isolées</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              Isolation stricte par utilisateur. Vos finances restent strictement les vôtres.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── How it works ────────────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Créez votre compte",
      description: "Inscription en moins d'une minute, puis ajoutez votre premier compte bancaire.",
    },
    {
      number: "02",
      title: "Ajoutez vos transactions",
      description: "Saisissez dépenses, revenus et virements. L'app suggère les récurrentes automatiquement.",
    },
    {
      number: "03",
      title: "Suivez & maîtrisez",
      description: "Budgets, objectifs, graphiques — visualisez votre situation financière en temps réel.",
    },
  ] as const

  return (
    <section className="border-border border-t bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-title">Comment ça marche</p>
          <h2 className="mt-3 font-bold text-3xl tracking-[-0.02em] sm:text-4xl">
            Opérationnel en 3 étapes
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal className="relative" delay={i * 0.1} key={step.number}>
              <div className="flex flex-col items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <span className="font-black text-primary text-sm">{step.number}</span>
                </div>
                {i < 2 ? (
                  <div aria-hidden="true" className="absolute top-6 left-12 hidden h-px w-[calc(100%-3.5rem)] bg-linear-to-r from-border to-transparent sm:block" />
                ) : null}
                <div>
                  <h3 className="font-semibold text-base">{step.title}</h3>
                  <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ─────────────────────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center sm:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-50%] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.15] blur-[130px]" />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
          <BarChartSvg size={28} />
        </div>
        <h2 className="mt-6 font-bold text-3xl tracking-[-0.02em] sm:text-4xl">
          Prêt à reprendre le contrôle ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Créez votre compte en moins d'une minute et démarrez le suivi de vos finances dès aujourd'hui.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="btn-gradient-primary w-full gap-2 hover:opacity-90 sm:w-auto"
            size="lg"
          >
            <Link href="/register">
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-muted-foreground/60 text-xs">
          Gratuit pour l'usage personnel · Phase 1
        </p>
      </Reveal>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-blue-600">
            <BarChartSvg size={15} />
          </div>
          <span className="font-semibold text-sm">Motion Finance</span>
        </Link>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Motion Finance · Vos finances, en clair.
        </p>
      </div>
    </footer>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────────── */

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesBentoSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
