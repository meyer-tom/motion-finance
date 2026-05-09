import type { ReactNode } from "react"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.05_293)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.04_293)_0%,transparent_60%)]"
      />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
