// Client-side only — all toast() calls must happen in event handlers, never during SSR render.

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastItem {
  description?: string
  duration: number
  id: string
  title: string
  variant: ToastVariant
}

type Listener = (item: ToastItem) => void

const listeners = new Set<Listener>()

function emit(
  variant: ToastVariant,
  title: string,
  opts?: { description?: string; duration?: number }
) {
  const item: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    variant,
    title,
    description: opts?.description,
    duration: opts?.duration ?? 4000,
  }
  for (const listener of listeners) {
    listener(item)
  }
}

export const toast = {
  success: (
    title: string,
    opts?: { description?: string; duration?: number }
  ) => emit("success", title, opts),
  error: (title: string, opts?: { description?: string; duration?: number }) =>
    emit("error", title, opts),
  warning: (
    title: string,
    opts?: { description?: string; duration?: number }
  ) => emit("warning", title, opts),
  info: (title: string, opts?: { description?: string; duration?: number }) =>
    emit("info", title, opts),
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
