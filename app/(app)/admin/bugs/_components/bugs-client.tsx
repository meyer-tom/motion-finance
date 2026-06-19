"use client"

const URL_ORIGIN_RE = /^https?:\/\/[^/]+/

import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Lightbulb,
  MinusCircle,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  deleteBugReport,
  updateBugReportStatus,
} from "@/lib/actions/bug-reports"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

/* ── Types ─────────────────────────────────────────────────────────────────── */

type FeedbackType = "BUG" | "FEATURE_REQUEST"
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX"

interface BugReportRow {
  createdAt: Date
  description: string
  id: string
  pageUrl: string
  screenshotUrl: string | null
  severity: Severity | null
  status: Status
  title: string
  type: FeedbackType
  user: { email: string; firstName: string; lastName: string }
  userAgent: string
}

interface BugsClientProps {
  readonly initialReports: BugReportRow[]
}

/* ── Config ─────────────────────────────────────────────────────────────────── */

const STATUS_FILTERS = [
  { label: "Tous", value: undefined },
  { label: "Ouverts", value: "OPEN" },
  { label: "En cours", value: "IN_PROGRESS" },
  { label: "Résolus", value: "RESOLVED" },
  { label: "Won't fix", value: "WONT_FIX" },
] as const

const TYPE_FILTERS = [
  { label: "Tout", value: undefined },
  { label: "Bugs", value: "BUG" },
  { label: "Features", value: "FEATURE_REQUEST" },
] as const

const STATUS_CONFIG: Record<
  Status,
  { icon: React.ElementType; label: string; className: string }
> = {
  OPEN: {
    icon: AlertCircle,
    label: "Ouvert",
    className: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
  },
  IN_PROGRESS: {
    icon: Clock,
    label: "En cours",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  },
  RESOLVED: {
    icon: CheckCircle2,
    label: "Résolu",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  WONT_FIX: {
    icon: MinusCircle,
    label: "Won't fix",
    className: "bg-muted text-muted-foreground",
  },
}

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> =
  {
    LOW: { label: "Faible", className: "bg-muted text-muted-foreground" },
    MEDIUM: {
      label: "Moyen",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    },
    HIGH: {
      label: "Élevé",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400",
    },
    CRITICAL: {
      label: "Critique",
      className: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
    },
  }

const TYPE_CONFIG: Record<
  FeedbackType,
  { icon: React.ElementType; label: string; className: string }
> = {
  BUG: {
    icon: Bug,
    label: "Bug",
    className: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
  },
  FEATURE_REQUEST: {
    icon: Lightbulb,
    label: "Feature",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400",
  },
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "OPEN", label: "Ouvert" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "RESOLVED", label: "Résolu" },
  { value: "WONT_FIX", label: "Won't fix" },
]

/* ── Report Card ────────────────────────────────────────────────────────────── */

function ReportCard({
  report,
  onStatusChange,
  onDelete,
}: {
  readonly report: BugReportRow
  readonly onStatusChange: (id: string, status: Status) => void
  readonly onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const statusCfg = STATUS_CONFIG[report.status]
  const typeCfg = TYPE_CONFIG[report.type]
  const TypeIcon = typeCfg.icon
  const StatusIcon = statusCfg.icon
  const reporterName = `${report.user.firstName} ${report.user.lastName}`.trim()

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "shrink-0 gap-1 font-medium text-xs",
                typeCfg.className
              )}
            >
              <TypeIcon className="size-3" />
              {typeCfg.label}
            </Badge>
            {report.severity ? (
              <Badge
                className={cn(
                  "shrink-0 gap-1 font-medium text-xs",
                  SEVERITY_CONFIG[report.severity].className
                )}
              >
                {SEVERITY_CONFIG[report.severity].label}
              </Badge>
            ) : null}
            <Badge
              className={cn(
                "shrink-0 gap-1 font-medium text-xs",
                statusCfg.className
              )}
            >
              <StatusIcon className="size-3" />
              {statusCfg.label}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm leading-snug">{report.title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
            <span>
              {reporterName} · {report.user.email}
            </span>
            <span>
              {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 gap-1 text-xs" size="sm" variant="outline">
                Statut
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <DropdownMenuItem
                  className={cn(report.status === value && "font-medium")}
                  key={value}
                  onClick={() => onStatusChange(report.id, value)}
                >
                  {label}
                  {report.status === value ? " ✓" : ""}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(report.id)}
            size="icon"
            title="Supprimer"
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="border-t px-4 pt-3 pb-4">
        <p
          className={cn(
            "whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed",
            !expanded && "line-clamp-3"
          )}
        >
          {report.description}
        </p>
        {report.description.length > 200 ? (
          <button
            className="mt-1 text-primary text-xs underline-offset-2 hover:underline"
            onClick={() => setExpanded(!expanded)}
            type="button"
          >
            {expanded ? "Réduire" : "Voir tout"}
          </button>
        ) : null}

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
          <a
            className="flex items-center gap-1 hover:text-foreground"
            href={report.pageUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-3" />
            {report.pageUrl.replace(URL_ORIGIN_RE, "") || "/"}
          </a>
        </div>

        {/* Screenshot */}
        {report.screenshotUrl ? (
          <div className="mt-3">
            <a
              href={report.screenshotUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                alt="Capture d'écran"
                className="rounded-lg border object-cover transition-opacity hover:opacity-90"
                height={200}
                src={report.screenshotUrl}
                width={400}
              />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ── Updater helpers (avoid deep nesting) ───────────────────────────────────── */

function applyStatusUpdate(
  rows: BugReportRow[],
  id: string,
  status: Status
): BugReportRow[] {
  return rows.map((r) => (r.id === id ? { ...r, status } : r))
}

function removeRow(rows: BugReportRow[], id: string): BugReportRow[] {
  return rows.filter((r) => r.id !== id)
}

function getTypeCount(
  value: FeedbackType | undefined,
  bugCount: number,
  featureCount: number,
  total: number
): number {
  if (value === "BUG") {
    return bugCount
  }
  if (value === "FEATURE_REQUEST") {
    return featureCount
  }
  return total
}

/* ── Main client component ──────────────────────────────────────────────────── */

export function BugsClient({ initialReports }: BugsClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [statusFilter, setStatusFilter] = useState<Status | undefined>(
    undefined
  )
  const [typeFilter, setTypeFilter] = useState<FeedbackType | undefined>(
    undefined
  )
  const [isPending, startTransition] = useTransition()

  const filtered = reports.filter((r) => {
    const matchStatus = statusFilter ? r.status === statusFilter : true
    const matchType = typeFilter ? r.type === typeFilter : true
    return matchStatus && matchType
  })

  function handleStatusChange(id: string, status: Status) {
    startTransition(async () => {
      try {
        setReports((prev) => applyStatusUpdate(prev, id, status))
        await updateBugReportStatus(id, status)
      } catch {
        toast.error("Erreur lors de la mise à jour du statut")
        setReports(initialReports)
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        setReports((prev) => removeRow(prev, id))
        await deleteBugReport(id)
        toast.success("Rapport supprimé")
      } catch {
        toast.error("Erreur lors de la suppression")
        setReports(initialReports)
      }
    })
  }

  const bugCount = reports.filter((r) => r.type === "BUG").length
  const featureCount = reports.filter(
    (r) => r.type === "FEATURE_REQUEST"
  ).length

  return (
    <div className="flex flex-col gap-4">
      {/* Filtres type */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(({ label, value }) => {
          const count = getTypeCount(
            value,
            bugCount,
            featureCount,
            reports.length
          )
          return (
            <button
              className={cn(
                "rounded-full px-3 py-1 font-medium text-xs transition-colors",
                typeFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              key={label}
              onClick={() => setTypeFilter(value as FeedbackType | undefined)}
              type="button"
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ label, value }) => {
          const count =
            value === undefined
              ? filtered.length
              : filtered.filter((r) => r.status === value).length
          return (
            <button
              className={cn(
                "rounded-full px-3 py-1 font-medium text-xs transition-colors",
                statusFilter === value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              key={label}
              onClick={() => setStatusFilter(value as Status | undefined)}
              type="button"
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card py-16 text-center">
          <AlertTriangle className="size-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground text-sm">
            Aucun rapport avec ces filtres
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-3",
            isPending && "pointer-events-none opacity-70"
          )}
        >
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              report={report}
            />
          ))}
        </div>
      )}
    </div>
  )
}
