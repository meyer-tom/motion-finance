import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Ajouter la Sidebar (issue dédiée) */}
      <div className="flex-1">
        {/* TODO: Ajouter le Header (issue dédiée) */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
