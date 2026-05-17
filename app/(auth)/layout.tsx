import type { ReactNode } from "react"

import { BarChartSvg } from "@/components/app/sidebar"

export default function AuthLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="blob-float absolute top-[-8%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.1] blur-[130px] dark:bg-primary/[0.14]" />
        <div className="blob-float-delayed absolute right-[-8%] bottom-[-8%] h-[420px] w-[420px] rounded-full bg-[var(--color-income)]/[0.06] blur-[120px] dark:bg-[var(--color-income)]/[0.09]" />
        <div className="absolute bottom-[15%] left-[-6%] h-[360px] w-[360px] rounded-full bg-violet-600/[0.06] blur-[120px] dark:bg-violet-600/[0.1]" />
      </div>

      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-700 shadow-lg shadow-primary/30">
          <BarChartSvg size={32} />
        </div>
        <span className="font-bold text-2xl tracking-[-0.02em]">
          Motion <span className="text-primary">Finance</span>
        </span>
      </div>

      {children}
    </div>
  )
}
