/**
 * Types pour le système d'upload de fichiers
 */

export interface UploadProgressEvent {
  loaded: number
  percentage: number
  total: number
}

export interface UploadResult {
  pathname: string
  url: string
}

export type UploadError =
  | { code: "FILE_TOO_LARGE"; maxSize: number }
  | { code: "INVALID_TYPE"; allowedTypes: string[] }
  | { code: "UPLOAD_FAILED"; message: string }
  | { code: "UNAUTHORIZED"; message: string }

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 Mo

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]
