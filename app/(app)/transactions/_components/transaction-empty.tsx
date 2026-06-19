import { ReceiptText, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionEmptyProps {
  hasActiveFilters: boolean
  onAddTransaction: () => void
  onClearFilters: () => void
}

export function TransactionEmpty({
  hasActiveFilters,
  onClearFilters,
  onAddTransaction,
}: TransactionEmptyProps) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
          <SearchX className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground text-sm">
            Aucun résultat
          </p>
          <p className="text-muted-foreground text-sm">
            Essayez d'élargir vos critères de recherche.
          </p>
        </div>
        <Button
          className="border-border"
          onClick={onClearFilters}
          size="sm"
          variant="outline"
        >
          Effacer les filtres
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
        <ReceiptText className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground text-sm">
          Aucune transaction
        </p>
        <p className="text-muted-foreground text-sm">
          Commencez par enregistrer votre première transaction.
        </p>
      </div>
      <Button
        className="btn-gradient-primary hover:opacity-90"
        onClick={onAddTransaction}
        size="sm"
      >
        Ajouter une transaction
      </Button>
    </div>
  )
}
