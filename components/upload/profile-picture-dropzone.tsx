"use client"

import { AlertCircle, Check, Upload, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useUploadProfilePicture } from "@/lib/upload"
import { MAX_FILE_SIZE } from "@/lib/upload/types"
import { cn } from "@/lib/utils"

interface ProfilePictureDropzoneProps {
  readonly className?: string
  readonly currentImageUrl?: string
  readonly onUploadComplete: (url: string) => void
}

export function ProfilePictureDropzone({
  onUploadComplete,
  currentImageUrl,
  className,
}: ProfilePictureDropzoneProps) {
  const { upload, isUploading, progress, error, uploadedUrl, reset } =
    useUploadProfilePicture()
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) {
        return
      }

      // Créer un preview local
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      try {
        const url = await upload(file)
        onUploadComplete(url)
        // Libérer l'URL objet après succès
        URL.revokeObjectURL(objectUrl)
      } catch {
        // En cas d'erreur, restaurer l'image précédente
        setPreview(currentImageUrl || null)
        URL.revokeObjectURL(objectUrl)
      }
    },
    [upload, onUploadComplete, currentImageUrl]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isUploading,
  })

  const handleRemove = useCallback(() => {
    reset()
    setPreview(currentImageUrl || null)
  }, [reset, currentImageUrl])

  return (
    <div className={cn("w-full", className)}>
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "rounded-2xl border-2 border-dashed",
          "bg-white/50 dark:bg-black/20",
          "backdrop-blur-xl",
          "transition-all duration-300",
          "cursor-pointer",
          "min-h-50 p-6",
          isDragActive &&
            "border-violet-500 bg-violet-50/50 dark:bg-violet-500/10",
          !isDragActive &&
            "border-gray-300 hover:border-violet-400 dark:border-gray-700 dark:hover:border-violet-600",
          isUploading && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {/* Preview de l'image */}
        {preview ? (
          <div className="relative mb-4 h-32 w-32">
            <Image
              alt="Photo de profil"
              className="rounded-full object-cover"
              fill
              src={preview}
            />
            {!isUploading && (
              <button
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white transition-colors hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-violet-100 p-4 dark:bg-violet-900/30">
              <Upload className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        )}

        {/* Texte et état */}
        <div className="space-y-2 text-center">
          {isUploading && (
            <>
              <p className="font-medium text-gray-700 text-sm dark:text-gray-300">
                Upload en cours... {progress}%
              </p>
              <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-violet-600 transition-all duration-300 dark:bg-violet-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}

          {!isUploading && uploadedUrl && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              <p className="font-medium text-sm">Image uploadée avec succès</p>
            </div>
          )}

          {!(isUploading || uploadedUrl) && (
            <>
              <p className="font-medium text-gray-700 text-sm dark:text-gray-300">
                {isDragActive && "Déposez l'image ici"}
                {!isDragActive && preview && "Cliquez ou glissez pour changer"}
                {!(isDragActive || preview) &&
                  "Cliquez ou glissez pour uploader"}
              </p>
              <p className="text-gray-500 text-xs dark:text-gray-400">
                JPEG, PNG ou WebP • Max {MAX_FILE_SIZE / 1024 / 1024} Mo
              </p>
            </>
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-red-700 text-sm dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
