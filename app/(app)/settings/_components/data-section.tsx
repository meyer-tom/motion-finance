"use client"

import { Download, Loader2, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteUserAccount } from "@/lib/actions/settings"

export function DataSection() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    window.location.href = "/api/export/csv"
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteUserAccount({ confirmation: confirmation as "SUPPRIMER" })
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Une erreur est survenue"
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exporter mes données</CardTitle>
          <CardDescription>
            Téléchargez toutes vos transactions au format CSV (compatible Excel)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Télécharger le CSV
          </Button>
          <p className="mt-2 text-muted-foreground text-xs">
            Inclut : date, type, montant, catégorie, compte, description et tags
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">
            Supprimer mon compte
          </CardTitle>
          <CardDescription>
            Cette action est irréversible. Toutes vos données seront
            définitivement supprimées : comptes, transactions, budgets,
            objectifs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog onOpenChange={setDeleteOpen} open={deleteOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Supprimer définitivement votre compte ?
                </DialogTitle>
                <DialogDescription>
                  Toutes vos données seront supprimées sans possibilité de
                  récupération. Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="confirmation">
                  Saisissez <strong>SUPPRIMER</strong> pour confirmer
                </Label>
                <Input
                  id="confirmation"
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="SUPPRIMER"
                  value={confirmation}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setDeleteOpen(false)
                    setConfirmation("")
                  }}
                  type="button"
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  disabled={confirmation !== "SUPPRIMER" || isPending}
                  onClick={handleDelete}
                  type="button"
                  variant="destructive"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression…
                    </>
                  ) : (
                    "Supprimer définitivement"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
