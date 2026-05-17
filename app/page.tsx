"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  Bell,
  ChartPie,
  PiggyBank,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { BarChartSvg } from "@/components/app/sidebar"
import { Button } from "@/components/ui/button"

const EASE_OUT = [0.16, 1, 0.3, 1] as const

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

const FEATURES = [
  {
    icon: Wallet,
    title: "Comptes multiples",
    description:
      "Courant, épargne — soldes calculés dynamiquement, jamais ressaisis à la main.",
  },
  {
    icon: Repeat2,
    title: "Transactions intelligentes",
    description:
      "Dépenses, revenus, virements. Filtres complets, recherche instantanée, infinite scroll.",
  },
  {
    icon: ChartPie,
    title: "Budgets par catégorie",
    description:
      "Plafonds mensuels, barres de progression colorées et alertes avant le dépassement.",
  },
  {
    icon: PiggyBank,
    title: "Objectifs d'épargne",
    description:
      "Suivez chaque objectif, calcul automatique du montant mensuel à mettre de côté.",
  },
  {
    icon: Bell,
    title: "Notifications in-app",
    description:
      "Budget à 80 %, objectif atteint, échéance récurrente — tout au bon moment.",
  },
  {
    icon: ShieldCheck,
    title: "Données isolées",
    description:
      "Isolation stricte par utilisateur. Vos finances restent strictement les vôtres.",
  },
] as const

const STATS = [
  { value: "12 480 €", label: "Solde suivi" },
  { value: "+ 3 200 €", label: "Revenus ce mois" },
  { value: "6 mois", label: "D'historique visualisé" },
  { value: "0 €", label: "Pour l'usage personnel" },
] as const

const MOCKUP_BARS = [
  { month: "m1", height: 40 },
  { month: "m2", height: 65 },
  { month: "m3", height: 35 },
  { month: "m4", height: 80 },
  { month: "m5", height: 55 },
  { month: "m6", height: 70 },
] as const

const MOCKUP_TRANSACTIONS = [
  { label: "Loyer", amount: "− 850 €", color: "text-[var(--color-expense)]" },
  { label: "Salaire", amount: "+ 2 800 €", color: "text-[var(--color-income)]" },
  { label: "Courses", amount: "− 120 €", color: "text-[var(--color-expense)]" },
  { label: "Épargne", amount: "− 300 €", color: "text-[var(--color-transfer)]" },
] as const

function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-700 shadow-sm shadow-primary/20">
            <BarChartSvg size={20} />
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
            className="btn-gradient-primary hover:opacity-90"
            size="sm"
          >
            <Link href="/register">Commencer</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob-float absolute top-[-15%] left-[10%] h-[500px] w-[500px] rounded-full bg-primary/[0.08] blur-[130px] dark:bg-primary/[0.12]" />
        <div className="blob-float-delayed absolute right-[5%] bottom-[-10%] h-[480px] w-[480px] rounded-full bg-violet-600/[0.07] blur-[130px] dark:bg-violet-600/[0.11]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-32">
        <FadeUp className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 font-medium text-muted-foreground text-xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            ✦ Vos finances, enfin sous contrôle
          </span>
        </FadeUp>

        <FadeUp className="mx-auto mt-6 max-w-4xl text-center" delay={0.08}>
          <h1 className="text-5xl font-black tracking-tighter leading-[0.9] md:text-7xl lg:text-8xl">
            <span className="text-gradient-primary">Maîtrisez</span>
            <br />
            <span className="text-foreground">votre argent.</span>
          </h1>
        </FadeUp>

        <FadeUp className="mx-auto mt-6 max-w-lg text-center" delay={0.16}>
          <p className="text-base text-muted-foreground sm:text-lg">
            Comptes, transactions, budgets et objectifs d'épargne réunis dans
            une application rapide, élégante et installable partout.
          </p>
        </FadeUp>

        <FadeUp
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          delay={0.24}
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
            <Link href="/login">Voir une démo</Link>
          </Button>
        </FadeUp>

        <FadeUp className="mt-6 flex items-center justify-center gap-6" delay={0.3}>
          {["100% privé", "Installable PWA", "Open source"].map((label) => (
            <span className="flex items-center gap-1.5 text-muted-foreground text-xs" key={label}>
              <Zap className="h-3 w-3 text-primary" />
              {label}
            </span>
          ))}
        </FadeUp>

        <FadeUp className="mx-auto mt-16 max-w-4xl" delay={0.36}>
          <DashboardMockup />
        </FadeUp>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="border-border border-y bg-card/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal
            className="px-6 py-10 text-center"
            delay={i * 0.05}
            key={stat.label}
          >
            <p className="font-bold font-mono text-3xl text-gradient-primary sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-muted-foreground text-sm">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-title">Fonctionnalités</p>
        <h2 className="mt-3 font-bold text-3xl tracking-[-0.02em] sm:text-4xl">
          Tout ce qu'il faut pour gérer vos finances
        </h2>
      </Reveal>

      <motion.div
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        transition={{ staggerChildren: 0.06 }}
        viewport={{ once: true, margin: "-60px" }}
        whileInView="visible"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <motion.div
            className="surface-card-interactive h-full p-5"
            key={title}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-base">{title}</h3>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.12_0.02_268)] shadow-2xl shadow-primary/10">
      <div className="flex items-center gap-1.5 border-border border-b bg-[oklch(0.14_0.025_268)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-income)]/60" />
        <span className="ml-3 font-mono text-[oklch(0.5_0.02_268)] text-xs">
          Motion Finance — Dashboard
        </span>
      </div>

      <div className="p-4">
        <div className="mb-3 rounded-lg border border-[oklch(0.25_0.04_268)] bg-gradient-to-br from-primary/15 to-transparent p-4">
          <p className="font-medium text-[oklch(0.55_0.05_258)] text-xs uppercase tracking-widest">
            Solde total
          </p>
          <p className="mt-1 font-bold font-mono text-3xl text-white sm:text-4xl">
            12 480,50 €
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[oklch(0.25_0.04_268)] bg-[oklch(0.14_0.025_268)] p-3">
            <p className="text-[oklch(0.5_0.02_268)] text-xs">Revenus</p>
            <p className="font-bold font-mono text-[var(--color-income)] text-lg">
              + 3 200 €
            </p>
          </div>
          <div className="rounded-lg border border-[oklch(0.25_0.04_268)] bg-[oklch(0.14_0.025_268)] p-3">
            <p className="text-[oklch(0.5_0.02_268)] text-xs">Dépenses</p>
            <p className="font-bold font-mono text-[var(--color-expense)] text-lg">
              − 1 845 €
            </p>
          </div>
          <div className="rounded-lg border border-[oklch(0.25_0.04_268)] bg-[oklch(0.14_0.025_268)] p-3">
            <p className="text-[oklch(0.5_0.02_268)] text-xs">Net</p>
            <p className="font-bold font-mono text-white text-lg">+ 1 355 €</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-end gap-1.5 rounded-lg border border-[oklch(0.25_0.04_268)] bg-[oklch(0.14_0.025_268)] p-3">
            {MOCKUP_BARS.map(({ month, height }) => (
              <div
                className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary"
                key={month}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>

          <div className="rounded-lg border border-[oklch(0.25_0.04_268)] bg-[oklch(0.14_0.025_268)] p-3">
            {MOCKUP_TRANSACTIONS.map(({ label, amount, color }) => (
              <div className="flex items-center justify-between py-1" key={label}>
                <span className="text-[oklch(0.7_0.02_268)] text-xs">{label}</span>
                <span className={`font-mono text-xs font-semibold ${color}`}>
                  {amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="section-title">Aperçu</p>
        <h2 className="mt-3 font-bold text-3xl tracking-[-0.02em] sm:text-4xl">
          Dashboard analytics en temps réel
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground text-sm">
          Visualisez l'ensemble de vos finances d'un seul coup d'œil — soldes,
          tendances et transactions récentes.
        </p>
      </Reveal>
      <Reveal className="mx-auto mt-10 max-w-4xl" delay={0.1}>
        <DashboardMockup />
      </Reveal>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center sm:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-60%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 font-medium text-muted-foreground text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Gratuit pour l'usage personnel
        </span>
        <h2 className="mt-6 font-bold text-3xl tracking-[-0.02em] sm:text-4xl">
          Prêt à reprendre le contrôle&nbsp;?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Créez votre compte en moins d'une minute et démarrez le suivi de vos
          finances dès aujourd'hui.
        </p>
        <Button
          asChild
          className="btn-gradient-primary mt-8 gap-2 hover:opacity-90"
          size="lg"
        >
          <Link href="/register">
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet-700">
            <BarChartSvg size={16} />
          </div>
          <span className="font-semibold text-sm">Motion Finance</span>
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Motion Finance. Vos finances, en clair.
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Usage personnel · Phase 1
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PreviewSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
