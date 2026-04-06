"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface BottomSheetProps {
  children: React.ReactNode
  description?: string
  onOpenChange: (open: boolean) => void
  open: boolean
  title?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: BottomSheetProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        side="bottom"
      >
        {/* Handle visuel */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        {(title ?? description) ? (
          <SheetHeader className="pt-0">
            {title ? <SheetTitle>{title}</SheetTitle> : null}
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </SheetHeader>
        ) : null}

        {children}
      </SheetContent>
    </Sheet>
  )
}
