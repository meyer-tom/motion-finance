"use client"

import { useCallback, useState } from "react"
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, type UploadError } from "./types"

/**
 * Valide un fichier avant upload
 * @param file - Fichier à valider
 * @returns UploadError si invalide, null si valide
 */
function validateFile(file: File): UploadError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as never)) {
    return {
      code: "INVALID_TYPE",
      allowedTypes: [...ALLOWED_IMAGE_TYPES],
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "FILE_TOO_LARGE",
      maxSize: MAX_FILE_SIZE,
    }
  }

  return null
}

/**
 * Formatte un message d'erreur en français
 */
function formatErrorMessage(error: UploadError): string {
  switch (error.code) {
    case "FILE_TOO_LARGE":
      return `Fichier trop volumineux. Taille maximale : ${(error.maxSize / 1024 / 1024).toFixed(0)} Mo`
    case "INVALID_TYPE":
      return `Type de fichier non autorisé. Formats acceptés : ${error.allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`
    case "UPLOAD_FAILED":
      return `Échec de l'upload : ${error.message}`
    case "UNAUTHORIZED":
      return "Vous devez être connecté pour uploader une image"
    default:
      return "Une erreur inattendue est survenue"
  }
}

interface UseUploadProfilePictureReturn {
  error: string | null
  isUploading: boolean
  progress: number
  reset: () => void
  upload: (file: File) => Promise<string>
  uploadedUrl: string | null
}

/**
 * Hook React pour uploader une photo de profil avec progression
 * @example
 * const { upload, isUploading, progress, error } = useUploadProfilePicture()
 * const url = await upload(file)
 */
export function useUploadProfilePicture(): UseUploadProfilePictureReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
    setUploadedUrl(null)
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    // Reset état
    setError(null)
    setProgress(0)
    setUploadedUrl(null)

    // Validation client
    const validationError = validateFile(file)
    if (validationError) {
      const errorMessage = formatErrorMessage(validationError)
      setError(errorMessage)
      throw new Error(errorMessage)
    }

    setIsUploading(true)

    try {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData()
      formData.append("file", file)

      // Utiliser XMLHttpRequest pour avoir la progression
      const xhr = new XMLHttpRequest()

      // Promise pour gérer la requête
      const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100)
            setProgress(percentage)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch {
              reject(new Error("Réponse invalide du serveur"))
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(
                new Error(errorResponse.error || "Erreur lors de l'upload")
              )
            } catch {
              reject(new Error(`Erreur HTTP ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Erreur réseau lors de l'upload"))
        })

        xhr.open("POST", "/api/upload")
        xhr.send(formData)
      })

      const response = await uploadPromise

      setUploadedUrl(response.url)
      setIsUploading(false)
      setProgress(100)

      return response.url
    } catch (err) {
      const uploadError: UploadError = {
        code: "UPLOAD_FAILED",
        message: err instanceof Error ? err.message : "Erreur inconnue",
      }
      const errorMessage = formatErrorMessage(uploadError)
      setError(errorMessage)
      setIsUploading(false)
      setProgress(0)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    upload: uploadFile,
    isUploading,
    progress,
    error,
    uploadedUrl,
    reset,
  }
}

/**
 * Helper simple pour uploader une photo de profil (sans hook React)
 * @param file - Fichier à uploader
 * @returns URL de l'image uploadée
 * @throws Error si validation ou upload échoue
 */
export async function uploadProfilePicture(file: File): Promise<string> {
  // Validation client
  const validationError = validateFile(file)
  if (validationError) {
    throw new Error(formatErrorMessage(validationError))
  }

  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erreur lors de l'upload")
    }

    const data = await response.json()
    return data.url
  } catch (err) {
    const uploadError: UploadError = {
      code: "UPLOAD_FAILED",
      message: err instanceof Error ? err.message : "Erreur inconnue",
    }
    throw new Error(formatErrorMessage(uploadError))
  }
}
