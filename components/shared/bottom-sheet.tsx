"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

interface BottomSheetProps {
  children: React.ReactNode
  description?: string
  onOpenChange: (open: boolean) => void
  open: boolean
  title?: string
}

const DISMISS_THRESHOLD = 80
const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)"

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: BottomSheetProps) {
  const titleId = useId()
  const descId = useId()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startYRef = useRef(0)
  const startXRef = useRef(0)
  const gestureDirRef = useRef<"h" | "v" | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDragY(0)
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      )
      return () => cancelAnimationFrame(id)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 380)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    // iOS requires position:fixed to actually lock body scroll
    const scrollY = window.scrollY
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = "100%"
    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  function handleTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY
    startXRef.current = e.touches[0].clientX
    gestureDirRef.current = null
  }

  function handleTouchMove(e: React.TouchEvent) {
    const deltaY = e.touches[0].clientY - startYRef.current
    const deltaX = e.touches[0].clientX - startXRef.current

    // Verrouille la direction au premier mouvement significatif
    if (gestureDirRef.current === null) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return
      gestureDirRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v"
    }

    if (gestureDirRef.current === "h") return

    const scrolledToTop = (panelRef.current?.scrollTop ?? 0) === 0
    if (deltaY > 0 && scrolledToTop) setDragY(deltaY)
  }

  function handleTouchEnd() {
    if (dragY > DISMISS_THRESHOLD) {
      onOpenChange(false)
    } else {
      setDragY(0)
    }
  }

  if (!mounted) return null

  const isDragging = dragY > 0
  const sheetY = visible ? (isDragging ? dragY : 0) : "100%"
  const backdropOpacity = visible
    ? isDragging
      ? Math.max(0, 1 - dragY / 300)
      : 1
    : 0

  return createPortal(
    <div
      aria-describedby={description ? descId : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-modal="true"
      className="fixed inset-0 z-50"
      role="dialog"
      style={{ pointerEvents: visible ? undefined : "none" }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/80"
        style={{
          opacity: backdropOpacity,
          transition: isDragging ? "none" : `opacity 0.35s ${SPRING}`,
        }}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel — scrollable container, no flex needed */}
      <div
        ref={panelRef}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl border-t bg-popover text-popover-foreground text-sm shadow-lg"
        style={{
          overflowX: "hidden",
          overflowY: isDragging ? "hidden" : "auto",
          overscrollBehavior: "contain",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          transform: `translateY(${typeof sheetY === "number" ? `${sheetY}px` : sheetY})`,
          transition: isDragging ? "none" : `transform 0.35s ${SPRING}`,
          willChange: "transform",
        }}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
      >
        {/* Handle — sticky so it stays visible while scrolling content */}
        <div
          className="sticky top-0 z-10 bg-popover py-2 select-none"
          onTouchStart={handleTouchStart}
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {(title ?? description) ? (
          <div className="px-6 pb-2">
            {title ? (
              <h2
                className="font-heading font-medium text-base text-foreground"
                id={titleId}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-muted-foreground text-sm" id={descId}>
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
