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
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">Aucun résultat</p>
          <p className="text-muted-foreground text-sm">
            Essayez d'élargir vos critères de recherche.
          </p>
        </div>
        <Button onClick={onClearFilters} size="sm" variant="outline">
          Effacer les filtres
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <ReceiptText className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">Aucune transaction</p>
        <p className="text-muted-foreground text-sm">
          Commencez par enregistrer votre première transaction.
        </p>
      </div>
      <Button onClick={onAddTransaction} size="sm">
        Ajouter une transaction
      </Button>
    </div>
  )
}
