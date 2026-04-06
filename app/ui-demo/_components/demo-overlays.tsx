"use client"

import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function DemoOverlays() {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Ouvrir Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une transaction</DialogTitle>
            <DialogDescription>
              Saisissez les détails de votre transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input placeholder="Description" />
            <Input placeholder="Montant (€)" type="number" />
          </div>
          <DialogFooter>
            <Button variant="outline">Annuler</Button>
            <Button>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Ouvrir Sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Nouvelle transaction</SheetTitle>
            <SheetDescription>
              Ajoutez rapidement une dépense ou un revenu.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-6 pb-6">
            <Input placeholder="Description" />
            <Input placeholder="Montant (€)" type="number" />
            <Button className="w-full">Enregistrer</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <BellIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Notifications</PopoverTitle>
          </PopoverHeader>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="expense" className="mt-0.5 shrink-0">
                Budget
              </Badge>
              <span className="text-muted-foreground">
                Alimentation à 87% du plafond
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 shrink-0">
                Objectif
              </Badge>
              <span className="text-muted-foreground">
                Vacances 2025 : 65% atteint 🎉
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Mon compte <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Tom Meyer</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon />
            Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <CheckIcon />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
