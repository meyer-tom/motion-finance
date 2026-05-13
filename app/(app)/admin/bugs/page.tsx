import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getBugReports } from "@/lib/actions/bug-reports"
import { auth } from "@/lib/auth"
import { BugsClient } from "./_components/bugs-client"

export default async function AdminBugsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const reports = await getBugReports()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl tracking-tight">Rapports de bugs</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {reports.length} rapport{reports.length > 1 ? "s" : ""} au total
        </p>
      </div>
      <BugsClient initialReports={reports} />
    </div>
  )
}
