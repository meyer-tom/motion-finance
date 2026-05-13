"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AlertCircle, Bug, ImagePlus, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { BottomSheet } from "@/components/shared/bottom-sheet"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { submitBugReport } from "@/lib/actions/bug-reports"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import { bugReportSchema, type BugReportInput } from "@/lib/validations/bug-reports"
import { Input } from "../ui/input"

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface BugReportDialogProps {
  readonly onOpenChange: (open: boolean) => void
  readonly open: boolean
}

/* ── Severity config ───────────────────────────────────────────────────────── */

const SEVERITIES = [
  { value: "LOW", label: "Faible", description: "Problème mineur, n'affecte pas l'usage" },
  { value: "MEDIUM", label: "Moyen", description: "Gêne l'utilisation mais une solution de contournement existe" },
  { value: "HIGH", label: "Élevé", description: "Problème important, fonctionnalité inutilisable" },
  { value: "CRITICAL", label: "Critique", description: "Perte de données ou blocage total" },
] as const

/* ── Upload helper ──────────────────────────────────────────────────────────── */

async function uploadImageFile(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null
  const formData = new FormData()
  formData.append("file", file, file.name)
  try {
    const res = await fetch("/api/upload/screenshot", { method: "POST", body: formData })
    if (!res.ok) return null
    const json = await res.json() as { url?: string }
    return json.url ?? null
  } catch {
    return null
  }
}

/* ── Screenshot zone ────────────────────────────────────────────────────────── */

interface ScreenshotZoneProps {
  readonly onUpload: (url: string) => void
  readonly onRemove: () => void
  readonly url: string | null
  readonly isOpen: boolean
}

function ScreenshotZone({ url, onUpload, onRemove, isOpen }: ScreenshotZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées")
      return
    }
    setIsUploading(true)
    const uploadedUrl = await uploadImageFile(file)
    setIsUploading(false)
    if (uploadedUrl) {
      onUpload(uploadedUrl)
    } else {
      toast.error("Impossible d'uploader l'image")
    }
  }, [onUpload])

  // Paste from clipboard
  useEffect(() => {
    if (!isOpen) return
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) handleFile(file)
          break
        }
      }
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isOpen, handleFile])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  if (url) {
    return (
      <div className="relative overflow-hidden rounded-lg border">
        <Image
          alt="Capture d'écran"
          className="w-full object-cover"
          height={200}
          src={url}
          width={400}
        />
        <button
          aria-label="Supprimer la capture"
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          onClick={onRemove}
          type="button"
        >
          <X className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        ref={fileInputRef}
        type="file"
      />
      <button
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/40",
          isUploading && "pointer-events-none opacity-60"
        )}
        disabled={isUploading}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        {isUploading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ImagePlus className="size-5" />
        )}
        <span className="text-xs">
          {isUploading
            ? "Upload en cours…"
            : "Glisse une image, clique pour choisir un fichier"}
        </span>
        <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-[11px]">
          <Upload className="size-3" />
          ou colle avec ⌘V / Ctrl+V
        </span>
      </button>
    </>
  )
}

/* ── Form ───────────────────────────────────────────────────────────────────── */

function BugReportForm({
  onClose,
  isOpen,
}: {
  readonly onClose: () => void
  readonly isOpen: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: standardSchemaResolver(bugReportSchema),
    defaultValues: {
      severity: "MEDIUM" as BugReportInput["severity"],
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
      title: "",
      description: "",
    },
  })

  const handleScreenshotUpload = useCallback((url: string) => {
    setScreenshotUrl(url)
    setValue("screenshotUrl", url)
  }, [setValue])

  const handleScreenshotRemove = useCallback(() => {
    setScreenshotUrl(null)
    setValue("screenshotUrl", undefined)
  }, [setValue])

  function onSubmit(data: BugReportInput) {
    startTransition(async () => {
      try {
        await submitBugReport(data)
        toast.success("Rapport envoyé, merci !")
        onClose()
      } catch {
        toast.error("Une erreur est survenue, réessaye.")
      }
    })
  }

  return (
    <form className="flex flex-col gap-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
      {/* Titre */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-title">Titre du problème</Label>
        <Input
          id="bug-title"
          placeholder="Ex : Le solde ne se met pas à jour après une transaction"
          {...register("title")}
        />
        {errors.title ? (
          <p className="flex items-center gap-1 text-destructive text-xs">
            <AlertCircle className="size-3" />
            {errors.title.message}
          </p>
        ) : null}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-description">Description</Label>
        <Textarea
          className="min-h-[100px] resize-none"
          id="bug-description"
          placeholder="Décris le problème : ce que tu faisais, ce qui s'est passé, ce que tu attendais…"
          {...register("description")}
        />
        {errors.description ? (
          <p className="flex items-center gap-1 text-destructive text-xs">
            <AlertCircle className="size-3" />
            {errors.description.message}
          </p>
        ) : null}
      </div>

      {/* Sévérité */}
      <div className="flex flex-col gap-1.5">
        <Label>Sévérité</Label>
        <Select
          defaultValue="MEDIUM"
          onValueChange={(v) => setValue("severity", v as BugReportInput["severity"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map(({ value, label, description }) => (
              <SelectItem key={value} value={value}>
                <span className="font-medium">{label}</span>
                <span className="ml-2 text-muted-foreground text-xs">{description}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Screenshot */}
      <div className="flex flex-col gap-1.5">
        <Label>Capture d&apos;écran</Label>
        <ScreenshotZone
          isOpen={isOpen}
          onRemove={handleScreenshotRemove}
          onUpload={handleScreenshotUpload}
          url={screenshotUrl}
        />
        <p className="text-muted-foreground text-xs">
          Optionnel — aide à identifier le problème visuel. Sur Mac : ⌘⇧4, puis ⌘V.
        </p>
      </div>

      {/* Actions */}
      <div className={cn("flex gap-2 pt-1", "flex-col-reverse sm:flex-row sm:justify-end")}>
        <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
          Annuler
        </Button>
        <Button className="gap-2" disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bug className="size-4" />
          )}
          {isPending ? "Envoi…" : "Envoyer le rapport"}
        </Button>
      </div>
    </form>
  )
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export function BugReportDialog({ open, onOpenChange }: BugReportDialogProps) {
  const isMobile = useIsMobile()

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  if (isMobile) {
    return (
      <BottomSheet
        description="Décris le problème rencontré et nous le corrigerons rapidement."
        onOpenChange={onOpenChange}
        open={open}
        title="Signaler un bug"
      >
        <BugReportForm isOpen={open} onClose={handleClose} />
      </BottomSheet>
    )
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="size-4 text-destructive" />
            Signaler un bug
          </DialogTitle>
          <DialogDescription>
            Décris le problème rencontré et nous le corrigerons rapidement.
          </DialogDescription>
        </DialogHeader>
        <BugReportForm isOpen={open} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
}
