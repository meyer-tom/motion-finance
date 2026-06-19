"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Camera, Loader2, Upload } from "lucide-react"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { updateProfile } from "@/lib/actions/settings"
import { authClient } from "@/lib/auth/client"
import { toast } from "@/lib/toast"
import { useUploadProfilePicture } from "@/lib/upload"
import { cn } from "@/lib/utils"
import {
  type UpdateProfileInput,
  updateProfileSchema,
} from "@/lib/validations/settings"

interface ProfileSectionProps {
  user: {
    firstName: string
    lastName: string
    email: string
    image?: string | null
    name: string
  }
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [isEmailPending, setIsEmailPending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.image ?? null
  )
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading, progress } = useUploadProfilePicture()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UpdateProfileInput>({
    resolver: standardSchemaResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  })

  function getInitials() {
    return `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
  }

  async function handleFileUpload(file: File) {
    try {
      const url = await upload(file)
      setPreviewUrl(url)
      await updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        image: url,
      })
      toast.success("Photo de profil mise à jour")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'upload"
      )
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    await handleFileUpload(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) {
      return
    }
    await handleFileUpload(file)
  }

  function onSubmit(data: UpdateProfileInput) {
    startTransition(async () => {
      try {
        await updateProfile({ ...data, image: previewUrl })
        toast.success("Profil mis à jour")
      } catch (err) {
        setError("root", {
          message:
            err instanceof Error ? err.message : "Une erreur est survenue",
        })
      }
    })
  }

  async function handleEmailChange() {
    if (!newEmail || newEmail === user.email) {
      return
    }

    setIsEmailPending(true)
    try {
      const result = await authClient.changeEmail({
        newEmail,
        callbackURL: "/settings?tab=profil",
      })

      if (result.error) {
        toast.error(result.error.message ?? "Erreur lors du changement d'email")
      } else {
        setEmailSent(true)
        toast.success("Email de vérification envoyé à votre nouvelle adresse")
      }
    } finally {
      setIsEmailPending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Photo de profil */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-border/60 border-b px-6 py-5">
          <h2 className="font-semibold text-base">Photo de profil</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            JPEG, PNG, WebP — 2 Mo max
          </p>
        </div>
        <div className="px-6 py-6">
          <button
            className={cn(
              "relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200",
              isDragging
                ? "scale-[1.01] border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
              isUploading && "pointer-events-none opacity-70"
            )}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            type="button"
          >
            <div className="relative">
              <Avatar className="h-20 w-20 shadow-md ring-4 ring-background">
                <AvatarImage alt={user.name} src={previewUrl ?? undefined} />
                <AvatarFallback className="font-semibold text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </div>

            {isUploading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  Upload en cours… {progress}%
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="flex items-center gap-1.5 font-medium text-sm">
                  <Upload className="h-3.5 w-3.5" />
                  {isDragging
                    ? "Déposez votre photo"
                    : "Glissez une photo ou cliquez"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {previewUrl ? "Remplacer la photo actuelle" : "Aucune photo"}
                </p>
              </div>
            )}
          </button>

          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInput}
            ref={fileInputRef}
            type="file"
          />
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-border/60 border-b px-6 py-5">
          <h2 className="font-semibold text-base">Informations personnelles</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Votre prénom et nom affichés dans l'application
          </p>
        </div>
        <div className="px-6 py-6">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="text-destructive text-sm">
                    {errors.firstName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="text-destructive text-sm">
                    {errors.lastName.message}
                  </p>
                ) : null}
              </div>
            </div>
            {errors.root ? (
              <p className="text-destructive text-sm">{errors.root.message}</p>
            ) : null}
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Adresse email */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-border/60 border-b px-6 py-5">
          <h2 className="font-semibold text-base">Adresse email</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Adresse actuelle : <strong>{user.email}</strong>
          </p>
        </div>
        <div className="space-y-4 px-6 py-6">
          {emailSent ? (
            <p className="text-muted-foreground text-sm">
              Un lien de vérification a été envoyé à <strong>{newEmail}</strong>
              . Cliquez sur le lien pour confirmer le changement.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Nouvelle adresse email</Label>
                <Input
                  id="newEmail"
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={user.email}
                  type="email"
                  value={newEmail}
                />
              </div>
              <Button
                disabled={
                  isEmailPending || !newEmail || newEmail === user.email
                }
                onClick={handleEmailChange}
                type="button"
                variant="outline"
              >
                {isEmailPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  "Modifier l'email"
                )}
              </Button>
            </>
          )}

          <Separator />
          <p className="text-muted-foreground text-xs">
            Un email de vérification sera envoyé à votre nouvelle adresse. Le
            changement sera effectif après confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}
