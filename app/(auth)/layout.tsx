import type { ReactNode } from "react"

import { BarChartSvg } from "@/components/app/sidebar"

export default function AuthLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.05_293)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.04_293)_0%,transparent_60%)]"
      />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-violet-600/30 bg-white shadow-md dark:border-indigo-500/30 dark:bg-[#0f0f1a]">
          <BarChartSvg size={38} />
        </div>
        <span className="font-extrabold text-3xl text-slate-900 tracking-[-0.04em] dark:text-white">
          Motion{" "}
          <span className="text-violet-700 dark:text-violet-400">Finance</span>
        </span>
      </div>

      {children}
    </div>
  )
}
