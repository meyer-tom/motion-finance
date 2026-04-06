# Motion Finance — Epics & Issues GitHub

> Document à destination de l'équipe de développement.
> Chaque issue est autonome et contient le contexte technique nécessaire à son implémentation.
> Ordre d'implémentation recommandé : suivre l'ordre des Epics.

---

## Epic 1 — Setup & Infrastructure

### Issue 1.1 — Initialisation du projet Next.js et configuration de base

**Labels** : `epic:setup`, `type:chore`

**Description**
Mettre en place la structure de base du projet avec toutes les dépendances nécessaires.

**Tâches**
- [ ] Next.js 16 avec App Router et TypeScript strict
- [ ] Tailwind CSS v4 configuré avec la police Geist (via `next/font/google`)
- [ ] shadcn/ui initialisé (`components.json` avec style "new-york")
- [ ] Alias de chemins `@/` configuré dans `tsconfig.json`
- [ ] Ultracite initialisé (`npx ultracite init`) pour la configuration zéro-config de ESLint, Biome, Prettier et Oxlint — optimisé pour les workflows IA
- [ ] Structure de dossiers :
  ```
  app/
    (auth)/           # layout sans sidebar
    (app)/            # layout avec sidebar + header
    (onboarding)/     # layout simplifié
  components/
    ui/               # shadcn primitives
    shared/           # composants réutilisables custom
    features/         # composants métier par domaine
  lib/
    db/               # client Prisma
    auth/             # config Better Auth
    actions/          # Server Actions organisées par domaine
    validations/      # schémas Zod partagés
  hooks/
  types/
  prisma/
    schema.prisma
    seed.ts
  ```
- [ ] Variables d'environnement : `.env.local.example` documenté avec toutes les clés nécessaires

---

### Issue 1.2 — Modèle de données PostgreSQL avec Prisma

**Labels** : `epic:setup`, `type:chore`

**Dépendances** : Issue 1.1

**Description**
Définir le schéma complet de la base de données et configurer Prisma avec Neon.

**Tâches**
- [ ] Installer `prisma` (dev) et `@prisma/client`
- [ ] Configurer `prisma/schema.prisma` avec le provider `postgresql` et l'URL Neon
- [ ] Schéma complet :

```prisma
model Account {
  id              String   @id @default(cuid())
  userId          String
  name            String
  type            AccountType
  startingBalance Decimal  @db.Decimal(12, 2)
  color           String
  icon            String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    Transaction[] @relation("AccountTransactions")
  transfersTo     Transaction[] @relation("TransferDestination")
  goals           SavingsGoal[]
  recurring       RecurringTransaction[]
}

enum AccountType {
  CHECKING
  SAVINGS
}

model Category {
  id          String        @id @default(cuid())
  userId      String?       // null = catégorie système
  name        String
  icon        String
  color       String
  type        CategoryType
  isSystem    Boolean       @default(false)
  isHidden    Boolean       @default(false)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user        User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]
  recurring   RecurringTransaction[]
}

enum CategoryType {
  EXPENSE
  INCOME
}

model Transaction {
  id            String          @id @default(cuid())
  userId        String
  accountId     String
  type          TransactionType
  amount        Decimal         @db.Decimal(12, 2)
  date          DateTime
  description   String?
  categoryId    String?         // null pour les virements
  toAccountId   String?         // non-null uniquement pour les virements
  tags          String[]        // array PostgreSQL natif
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  account       Account         @relation("AccountTransactions", fields: [accountId], references: [id])
  toAccount     Account?        @relation("TransferDestination", fields: [toAccountId], references: [id])
  category      Category?       @relation(fields: [categoryId], references: [id])
}

enum TransactionType {
  EXPENSE
  INCOME
  TRANSFER
}

model RecurringTransaction {
  id          String            @id @default(cuid())
  userId      String
  name        String
  amount      Decimal           @db.Decimal(12, 2)
  categoryId  String
  accountId   String
  frequency   RecurringFrequency
  isActive    Boolean           @default(true)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category          @relation(fields: [categoryId], references: [id])
  account     Account           @relation(fields: [accountId], references: [id])
}

enum RecurringFrequency {
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

model Budget {
  id          String   @id @default(cuid())
  userId      String
  categoryId  String
  amount      Decimal  @db.Decimal(12, 2)
  month       DateTime // toujours le 1er du mois à minuit UTC
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, month])
}

model SavingsGoal {
  id            String    @id @default(cuid())
  userId        String
  name          String
  targetAmount  Decimal   @db.Decimal(12, 2)
  currentAmount Decimal   @db.Decimal(12, 2) @default(0)
  deadline      DateTime?
  accountId     String?
  isCompleted   Boolean   @default(false)
  completedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  account       Account?  @relation(fields: [accountId], references: [id])
}

model Notification {
  id            String           @id @default(cuid())
  userId        String
  type          NotificationType
  title         String
  body          String
  isRead        Boolean          @default(false)
  relatedEntity Json?            // { type: 'budget'|'goal', id: string, threshold?: number }
  createdAt     DateTime         @default(now())

  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  WARNING
  DANGER
  SUCCESS
  INFO
}

model OnboardingProgress {
  userId              String   @id
  checklistCompleted  String[] // ['account', 'profile', 'savings', ...]
  checklistDismissed  Boolean  @default(false)
  tooltipsSeen        String[] // ['transactions', 'budgets', ...]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] Client Prisma exporté depuis `lib/db/index.ts` avec singleton pattern pour éviter les connexions multiples en dev :
  ```ts
  import { PrismaClient } from '@prisma/client'
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- [ ] Première migration : `prisma migrate dev --name init`
- [ ] Seed script `prisma/seed.ts` pour les catégories système (voir Epic 6)
- [ ] Configurer `prisma.seed` dans `package.json`

---

### Issue 1.3 — Configuration Better Auth

**Labels** : `epic:setup`, `type:chore`

**Dépendances** : Issue 1.2

**Description**
Configurer Better Auth avec adaptateur Prisma, stratégie email/mot de passe.

**Tâches**
- [ ] Installer `better-auth` et `better-auth/adapters/prisma`
- [ ] Config dans `lib/auth/index.ts` :
  - Email + password activés
  - Session via cookies HTTP-only
  - Plugin `remember-me` pour "Rester connecté" (session 30 jours vs 1 jour)
- [ ] Route handler `app/api/auth/[...all]/route.ts`
- [ ] Helper `auth()` côté serveur pour récupérer la session dans les RSC et Server Actions
- [ ] Middleware `middleware.ts` : redirection vers `/login` si non authentifié sur les routes `(app)/`
- [ ] Types TypeScript étendus pour la session (prénom, nom accessibles)

---

### Issue 1.4 — Configuration Resend pour les emails transactionnels

**Labels** : `epic:setup`, `type:chore`

**Dépendances** : Issue 1.3

**Tâches**
- [ ] Installer `resend`
- [ ] Client Resend dans `lib/email/index.ts`
- [ ] Template React Email pour la réinitialisation du mot de passe
- [ ] Helper `sendPasswordResetEmail(to, resetUrl)` typé
- [ ] Variables d'env : `RESEND_API_KEY`, `EMAIL_FROM`

---

### Issue 1.5 — Configuration Better Upload

**Labels** : `epic:setup`, `type:chore`

**Dépendances** : Issue 1.3

**Tâches**
- [ ] Installer et configurer Better Upload
- [ ] Route handler upload : `app/api/upload/route.ts`
- [ ] Limites : images uniquement, max 2 Mo, formats JPEG/PNG/WebP
- [ ] Helper `uploadProfilePicture(file)` dans `lib/upload/index.ts`

---

## Epic 2 — Design System & Micro-interactions

> Initialisé dès le début du projet pour que tous les composants suivants utilisent directement les bons styles.

### Issue 2.1 — Design system : tokens sémantiques et composants shadcn

**Labels** : `epic:design`, `type:chore`
**Statut** : ✅ Fermée

**Dépendances** : Issue 1.1

**Contexte**

L'interface adopte le style standard **shadcn/ui** — composants opaques, pas d'effet translucide. Un style Liquid Glass (backdrop-filter) avait été envisagé mais abandonné : les composants Radix (Dropdown, Dialog, Popover, Sheet) s'ancrent au niveau du `<body>` via des portails et ne voient pas les gradients de la page, rendant l'effet impossible sans hacks fragiles.

**Description**

Mettre en place les fondations visuelles réutilisables dans tout le projet :
- Tokens CSS pour les couleurs sémantiques métier
- Variants shadcn/ui pour les composants `Badge` et `Progress`
- Page `/ui-demo` servant de référence visuelle et de bac à sable pour les composants et graphiques

**Tâches**

- [x] Définir les tokens CSS sémantiques dans `globals.css` (valeurs OKLCH natives Tailwind v4, `theme()` non disponible) :
```css
:root {
  --color-income:   oklch(0.713 0.194 142.5);   /* emerald-500 */
  --color-expense:  oklch(0.641 0.237 15.34);    /* rose-500 */
  --color-transfer: oklch(0.685 0.168 237.32);   /* sky-500 */
  --color-accent:   oklch(0.541 0.281 293.009);  /* violet-600 */
}
```
- [x] Masquer les flèches natives sur `<input type="number">` (webkit + moz, y compris au survol)
- [x] Ajouter les variants `income`, `expense`, `transfer` au composant `Badge` via `cva` :
```tsx
income:   "border-transparent bg-[var(--color-income)]/15 text-[var(--color-income)]",
expense:  "border-transparent bg-[var(--color-expense)]/15 text-[var(--color-expense)]",
transfer: "border-transparent bg-[var(--color-transfer)]/15 text-[var(--color-transfer)]",
```
- [x] Adapter `Progress` pour accepter `--progress-color` via `style` inline — évite de multiplier les variants hard-codés pour les budgets
- [x] Créer la page `/ui-demo` (Server Component) avec les sections : Buttons, Badges, Cards, Graphiques, Progress/Budgets, Inputs, Overlays
- [x] Extraire les composants interactifs dans `_components/demo-overlays.tsx` (`"use client"`) pour éviter les erreurs d'hydratation
- [x] Graphiques Recharts dans `_components/demo-charts.tsx` (`"use client"`) : `BarChart` revenus vs dépenses, `AreaChart` solde cumulé, `PieChart` répartition catégories
- [x] Charger les graphiques via `next/dynamic` + `ssr: false` dans un wrapper client (`demo-charts-wrapper.tsx`)

**Definition of Done**

- [x] `pnpm build` passe sans erreur TypeScript
- [x] `/ui-demo` s'affiche correctement en thème clair et sombre
- [x] Les badges `income`, `expense`, `transfer` appliquent les couleurs sémantiques dans les deux thèmes
- [x] La `Progress` bar change de couleur via `--progress-color` (vert / orange / rouge)
- [x] Les trois graphiques Recharts s'affichent sans erreur d'hydratation
- [x] `CLAUDE.md` et `motion-finance-cdc.md` mis à jour pour refléter l'abandon du Liquid Glass

---

### Issue 2.2 — Composants de base animés

**Labels** : `epic:design`, `type:feature`

**Dépendances** : Issue 2.1

**Description**
Créer les composants fondamentaux réutilisables qui seront utilisés dans tous les epics suivants.

**Tâches**
- [ ] **`AnimatedAmount`** : affiche un montant avec effet compteur progressif
  - Utilise `requestAnimationFrame`, durée 800ms, easing ease-out
  - S'anime au mount et à chaque changement de valeur
  - Props : `value: number`, `currency: string`, `className?: string`
  - Couleur selon le contexte : prop `variant?: 'income' | 'expense' | 'transfer' | 'neutral'`
- [ ] **`Skeleton`** : composant de placeholder avec animation pulse
  - Utilisé systématiquement dans tous les `<Suspense fallback>` et états de chargement
  - Variantes : `SkeletonText`, `SkeletonCard`, `SkeletonAvatar`
- [ ] **`AnimatedProgress`** : barre de progression qui s'anime à l'entrée dans le viewport
  - `IntersectionObserver` pour déclencher l'animation
  - Props : `value: number` (0-100), `variant?: 'green' | 'orange' | 'red' | 'accent'`
  - Couleur dynamique selon la valeur pour les budgets : verte <60%, orange 60-90%, rouge >90%
- [ ] **`BottomSheet`** : composant de panneau glissant depuis le bas (mobile)
  - Animation `slide-in-from-bottom duration-300`
  - Overlay avec fermeture au tap
  - Gestion du `safe-area-inset-bottom`
  - Style `.glass-sheet`
- [ ] **`vibrate(pattern)`** : helper dans `lib/utils/haptics.ts` wrappant `navigator.vibrate` avec check de support

---

### Issue 2.3 — Animation de complétion d'objectif (confettis)

**Labels** : `epic:design`, `type:feature`

**Dépendances** : Issue 2.2

**Tâches**
- [ ] Installer `canvas-confetti` + `@types/canvas-confetti`
- [ ] Chargement en `dynamic(() => import('canvas-confetti'), { ssr: false })` pour ne pas alourdir le bundle initial
- [ ] Composant `GoalCompletionCelebration` déclenché via prop `isCompleted: boolean` :
  - Confettis pendant 3 secondes avec couleurs violet/vert
  - `vibrate([100, 50, 200])` sur mobile
  - Toast de succès prominent avec badge "Complété"
- [ ] Exporté depuis `components/shared/goal-completion-celebration.tsx`

---

## Epic 3 — Layout applicatif & Navigation

### Issue 3.1 — Layout principal avec sidebar (desktop) et bottom nav (mobile)

**Labels** : `epic:layout`, `type:feature`

**Dépendances** : Issue 1.3, Issue 2.1

**Description**
Créer le layout englobant toutes les pages authentifiées.

**Tâches**
- [ ] Layout `app/(app)/layout.tsx` : vérifie la session, redirect si non auth
- [ ] **Sidebar desktop** (visible ≥ `lg`) :
  - Fixe à gauche, largeur 240px, style `.glass-sidebar`
  - Logo + nom app en haut
  - Navigation : Dashboard, Transactions, Budgets, Objectifs, Paramètres
  - Avatar + nom utilisateur en bas avec menu déroulant `.glass-popover` (Paramètres, Déconnexion)
- [ ] **Bottom navigation mobile** (visible < `lg`) :
  - Position fixed en bas, style `.glass-sheet` adapté, `safe-area-inset-bottom`
  - 5 entrées : Dashboard, Transactions, Budgets, Objectifs, +
  - Le bouton "+" ouvre le `BottomSheet` du formulaire d'ajout de transaction
- [ ] **Header** :
  - Titre de la page courante
  - Icône cloche notifications (badge rouge si non-lues)
  - Bouton toggle thème
  - Style `.glass-header`
- [ ] Animations d'entrée fluides (CSS transitions, pas de lib externe pour ça)

---

### Issue 3.2 — Système de thème clair/sombre

**Labels** : `epic:layout`, `type:feature`

**Dépendances** : Issue 3.1

**Tâches**
- [ ] `next-themes` déjà installé — configurer `ThemeProvider` dans le root layout
- [ ] Composant `ThemeToggle` : trois options — Clair / Sombre / Automatique (icônes Sun / Moon / Monitor)
- [ ] Persistance du choix en base (champ `theme` dans les préférences utilisateur) ET dans `localStorage` pour éviter le FOUC
- [ ] Vérifier que les classes `.glass` et `.dark .glass` rendent correctement dans les deux thèmes

---

## Epic 4 — Authentification

### Issue 4.1 — Pages Login et Register

**Labels** : `epic:auth`, `type:feature`

**Dépendances** : Issue 1.3, Issue 2.1

**Tâches**
- [ ] Layout `app/(auth)/layout.tsx` : centré, fond avec gradient violet/indigo subtil, logo Motion Finance
- [ ] Page `app/(auth)/login/page.tsx` :
  - Champs : email, mot de passe
  - Checkbox "Rester connecté"
  - Lien "Mot de passe oublié ?" + lien vers `/register`
  - Server Action `loginAction(formData)` : appel Better Auth, redirect vers `/` ou `/onboarding`
  - Card formulaire style `.glass-card`
- [ ] Page `app/(auth)/register/page.tsx` :
  - Champs : prénom, nom, email, mot de passe, confirmation mot de passe
  - Server Action `registerAction(formData)` : validation Zod, appel Better Auth, redirect vers `/onboarding`
- [ ] Validation Zod côté client (react-hook-form) ET serveur (dans les Server Actions)
- [ ] Messages d'erreur inline sur les champs concernés

---

### Issue 4.2 — Réinitialisation du mot de passe

**Labels** : `epic:auth`, `type:feature`

**Dépendances** : Issue 4.1, Issue 1.4

**Tâches**
- [ ] Page `app/(auth)/forgot-password/page.tsx` : champ email + Server Action → envoi mail via Resend
- [ ] Page `app/(auth)/reset-password/page.tsx` : nouveau mot de passe + confirmation, token lu depuis les query params
- [ ] Server Action `resetPasswordAction(token, password)` : validation du token via Better Auth, update du mot de passe
- [ ] Messages appropriés : token expiré, token invalide, succès

---

## Epic 5 — Comptes financiers

### Issue 5.1 — CRUD Comptes financiers

**Labels** : `epic:accounts`, `type:feature`

**Dépendances** : Issue 1.2, Issue 3.1

**Tâches**
- [ ] **Server Actions** dans `lib/actions/accounts.ts` :
  - `createAccount(data)` : validation Zod, `prisma.account.create`, revalidatePath
  - `updateAccount(id, data)` : vérifie ownership, `prisma.account.update`
  - `deleteAccount(id)` : vérifie ownership, `prisma.account.delete` (cascade sur les transactions configuré en schema)
  - `getAccounts(userId)` : retourne les comptes avec solde calculé
- [ ] **Calcul du solde** via Prisma :
  ```ts
  const result = await prisma.transaction.aggregate({
    where: { OR: [{ accountId: id }, { toAccountId: id }] },
    _sum: { amount: true }
  })
  // + logique pour déduire selon le type et le sens du virement
  ```
  Ou via une requête SQL raw `prisma.$queryRaw` pour la performance si nécessaire.
- [ ] **`AccountFormSheet`** (utilise le composant `BottomSheet` de l'Epic 2) :
  - Nom, type (Courant / Épargne), solde de départ (création uniquement), couleur, icône
- [ ] **`AccountCard`** style `.glass-card` : nom, icône, couleur, solde avec `AnimatedAmount`

---

## Epic 6 — Catégories

### Issue 6.1 — Seed des catégories système

**Labels** : `epic:categories`, `type:chore`

**Dépendances** : Issue 1.2

**Tâches**
- [ ] Script `prisma/seed.ts` avec `prisma.category.createMany` :
  - **Dépenses** : Alimentation (ShoppingCart), Restaurants & Cafés (UtensilsCrossed), Transport (Car), Logement (Home), Santé (Heart), Loisirs (Gamepad2), Shopping (ShoppingBag), Abonnements (RefreshCw), Éducation (GraduationCap), Sport (Dumbbell), Voyages (Plane), Cadeaux (Gift), Divers (MoreHorizontal)
  - **Revenus** : Salaire (Briefcase), Freelance (Laptop), Remboursement (RotateCcw), Investissements (TrendingUp), Autres revenus (PlusCircle)
  - Toutes avec `isSystem: true`, `userId: null`
  - Utiliser `skipDuplicates: true` pour pouvoir relancer le seed sans erreur
- [ ] Fonction `getCategoriesForUser(userId)` dans `lib/actions/categories.ts` : catégories système non-masquées + catégories perso de l'utilisateur, triées par type puis nom

---

### Issue 6.2 — Interface de gestion des catégories

**Labels** : `epic:categories`, `type:feature`

**Dépendances** : Issue 6.1

**Tâches**
- [ ] Page accessible via Paramètres > Catégories
- [ ] **Catégories système** : affichées en lecture seule avec toggle "Masquer/Afficher" → Server Action `toggleCategoryVisibility(id)`
- [ ] **Catégories personnalisées** : CRUD complet
  - `CategoryFormSheet` : nom, icône (sélecteur ~30 icônes Lucide), couleur (palette), type (Dépense / Revenu)
  - Suppression avec confirmation si des transactions y sont associées (vérifier avec `prisma.transaction.count({ where: { categoryId: id } })`)
- [ ] Server Actions : `createCategory`, `updateCategory`, `deleteCategory`
- [ ] Validation : nom unique par (userId, type)

---

## Epic 7 — Transactions

### Issue 7.1 — Server Actions Transactions

**Labels** : `epic:transactions`, `type:feature`

**Dépendances** : Issue 1.2, Issue 5.1

**Tâches**
- [ ] **Server Actions** dans `lib/actions/transactions.ts` :
  - `createTransaction(data)` : validation Zod, `prisma.transaction.create`, appel `checkBudgetAlerts`, revalidatePath
  - `updateTransaction(id, data)` : vérifie ownership, update, revalidatePath
  - `deleteTransaction(id)` : vérifie ownership, `prisma.transaction.delete`
  - `getTransactions(userId, filters)` : keyset pagination sur `(date DESC, id DESC)` pour l'infinite scroll
    ```ts
    await prisma.transaction.findMany({
      where: { userId, ...buildWhereClause(filters) },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: 20,
      // cursor: { id: lastId } si cursor fourni
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    })
    ```
- [ ] **Schéma Zod `TransactionSchema`** partagé dans `lib/validations/transaction.ts`
- [ ] Règle absolue : `WHERE type != 'TRANSFER'` dans tous les agrégats de revenus/dépenses

---

### Issue 7.2 — Formulaire d'ajout/modification de transaction

**Labels** : `epic:transactions`, `type:feature`

**Dépendances** : Issue 7.1, Issue 6.1, Issue 2.2

**Description**
Le formulaire est le cœur de l'UX — accessible en moins de 2 interactions depuis n'importe quelle page.

**Tâches**
- [ ] Composant `TransactionFormSheet` : utilise `BottomSheet` sur mobile, `Dialog` sur desktop
- [ ] **Onglets de type** : Dépense / Revenu / Virement — segmented control avec animation fluide
- [ ] **Champs selon le type** :
  - Dépense/Revenu : montant, date, compte, catégorie, description, tags
  - Virement : montant, date, compte source, compte destination, description
- [ ] **Section Suggestions** : liste horizontale scrollable des récurrences actives (voir Issue 8.2)
- [ ] **Sélecteur de catégorie** : grille d'icônes + noms, filtré par type
- [ ] **Input montant** : `inputmode="decimal"`, formatage automatique
- [ ] **Tags** : input libre avec chips (ajout par Entrée ou virgule, suppression par ×)
- [ ] Validation Zod en temps réel avec messages d'erreur inline
- [ ] Accessible depuis : bouton "+" bottom nav mobile, bouton header desktop, bouton page Transactions, shortcut PWA `?action=add-transaction`

---

### Issue 7.3 — Page liste des transactions avec infinite scroll

**Labels** : `epic:transactions`, `type:feature`

**Dépendances** : Issue 7.1, Issue 7.2

**Tâches**
- [ ] Page `app/(app)/transactions/page.tsx`
- [ ] **Infinite scroll** : `IntersectionObserver` sur sentinel en bas de liste + `useInfiniteQuery` TanStack Query avec curseur
- [ ] **Regroupement par date** : séparateur sticky "Aujourd'hui", "Hier", "Lundi 18 mars"...
- [ ] **`TransactionItem`** :
  - Icône catégorie, description ou nom catégorie, compte (chip), montant coloré, tags
  - Swipe sur mobile pour éditer/supprimer, hover menu sur desktop
  - Virements : style distinct, bleu ciel, "Source → Destination"
- [ ] **Barre de filtres** : période, type, compte (multi), catégorie (multi), montant min/max, tags, recherche textuelle
- [ ] Skeletons pendant chargement initial et chargements suivants
- [ ] État vide contextuel selon les filtres actifs

---

## Epic 8 — Transactions récurrentes

### Issue 8.1 — CRUD Transactions récurrentes

**Labels** : `epic:recurring`, `type:feature`

**Dépendances** : Issue 7.1, Issue 6.2

**Tâches**
- [ ] Server Actions dans `lib/actions/recurring.ts` : `createRecurring`, `updateRecurring`, `deleteRecurring`, `toggleRecurring`
- [ ] `RecurringFormSheet` : nom, montant, catégorie, compte, fréquence
- [ ] Page de gestion (section dans Paramètres ou sous-page de Transactions)

---

### Issue 8.2 — Suggestions de pré-remplissage dans le formulaire de transaction

**Labels** : `epic:recurring`, `type:feature`

**Dépendances** : Issue 8.1, Issue 7.2

**Tâches**
- [ ] Fonction `getSuggestedRecurring(userId, currentDate)` :
  - Récupère toutes les récurrences actives
  - Calcule la "prochaine date attendue" selon la fréquence et la dernière transaction associée (ou date de création si aucune)
  - Trie par distance absolue entre date attendue et `currentDate`
- [ ] Composant `RecurringSuggestions` : chips horizontaux scrollables dans `TransactionFormSheet`
- [ ] Au clic : pré-remplit type, montant, catégorie, compte — modifiable avant validation

---

## Epic 9 — Budgets

### Issue 9.1 — CRUD Budgets

**Labels** : `epic:budgets`, `type:feature`

**Dépendances** : Issue 1.2, Issue 6.1, Issue 7.1

**Tâches**
- [ ] Server Actions dans `lib/actions/budgets.ts` :
  - `createBudget(data)` : validation, `prisma.budget.create`, revalidatePath
  - `updateBudget(id, data)` : vérifie ownership
  - `deleteBudget(id)` : vérifie ownership
  - `getBudgetsWithSpending(userId, month)` :
    ```ts
    // Pour chaque budget, calculer le montant dépensé du mois
    const spending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
        categoryId: { in: budgetCategoryIds }
      },
      _sum: { amount: true }
    })
    ```
- [ ] Schéma Zod : `{ categoryId, amount: positive, month: date }`
- [ ] Contrainte unique `(userId, categoryId, month)` gérée en base (schema Prisma `@@unique`) et message d'erreur applicatif

---

### Issue 9.2 — Interface Budgets

**Labels** : `epic:budgets`, `type:feature`

**Dépendances** : Issue 9.1, Issue 2.2

**Tâches**
- [ ] Page `app/(app)/budgets/page.tsx`
- [ ] Sélecteur de mois (mois précédent / courant / suivant)
- [ ] **`BudgetCard`** style `.glass-card` :
  - Nom + icône catégorie, montant dépensé / budget
  - `AnimatedProgress` avec couleur dynamique (<60% vert, 60-90% orange, >90% rouge)
  - Pourcentage affiché
- [ ] `BudgetFormSheet` : sélection catégorie, montant
- [ ] **Suggestion de reconduction** : bandeau affiché si le mois courant n'a aucun budget ET le mois précédent en avait → bouton "Reprendre les budgets de [mois]" — jamais automatique
- [ ] État vide avec CTA "Créer votre premier budget"

---

### Issue 9.3 — Alertes budgets

**Labels** : `epic:budgets`, `type:feature`

**Dépendances** : Issue 9.1, Issue 11.1

**Tâches**
- [ ] Fonction `checkBudgetAlerts(userId)` dans `lib/actions/budgets.ts` :
  - Calcule le % de consommation pour chaque budget du mois courant
  - Dédoublonnage via `notifications.relatedEntity` : `{ type: 'budget', id, threshold: 80|100 }`
  - Crée les notifications manquantes via `prisma.notification.create`
- [ ] Appelée dans `createTransaction` et `updateTransaction`

---

## Epic 10 — Objectifs d'épargne

### Issue 10.1 — CRUD Objectifs d'épargne

**Labels** : `epic:goals`, `type:feature`

**Dépendances** : Issue 1.2, Issue 5.1

**Tâches**
- [ ] Server Actions dans `lib/actions/goals.ts` : `createGoal`, `updateGoal`, `deleteGoal`
- [ ] `updateGoalAmount(id, newAmount)` : met à jour `currentAmount`, si `>= targetAmount` → appelle `completeGoal`
- [ ] `completeGoal(id)` : `isCompleted = true`, `completedAt = now()`, crée notification SUCCESS

---

### Issue 10.2 — Interface Objectifs d'épargne

**Labels** : `epic:goals`, `type:feature`

**Dépendances** : Issue 10.1, Issue 2.3

**Tâches**
- [ ] Page `app/(app)/goals/page.tsx` avec onglets "En cours" / "Complétés"
- [ ] **`GoalCard`** style `.glass-card` :
  - Nom, montant actuel / cible, `AnimatedProgress`, pourcentage
  - Si deadline : "Il vous reste X mois — épargnez X€/mois"
  - Bouton "Mettre à jour le montant" → input inline ou mini-dialog
- [ ] Déclenche `GoalCompletionCelebration` au passage à 100%
- [ ] Onglet "Complétés" : liste archivée avec badge et date d'achèvement
- [ ] États vides avec CTAs contextuels

---

## Epic 11 — Notifications in-app

### Issue 11.1 — Système de notifications

**Labels** : `epic:notifications`, `type:feature`

**Dépendances** : Issue 1.2, Issue 2.1

**Tâches**
- [ ] Server Actions dans `lib/actions/notifications.ts` :
  - `getNotifications(userId)` : triées par date desc
  - `markAsRead(id)`, `markAllAsRead(userId)`, `deleteNotification(id)`
- [ ] **`NotificationBell`** dans le header : badge rouge avec count non-lues
- [ ] **`NotificationPanel`** style `.glass-popover` :
  - Glisse depuis le haut-droit
  - Icône selon type (⚠️ WARNING, 🔴 DANGER, ✅ SUCCESS, ℹ️ INFO)
  - Bouton "Tout marquer comme lu", bouton × par notification
  - État vide : "Aucune notification"

---

## Epic 12 — Dashboard

### Issue 12.1 — Données du dashboard

**Labels** : `epic:dashboard`, `type:feature`

**Dépendances** : Issue 5.1, Issue 9.1, Issue 10.1

**Tâches**
- [ ] Fonction `getDashboardData(userId, period)` dans `lib/actions/dashboard.ts` :
  - Paralléliser toutes les requêtes indépendantes avec `Promise.all()`
  - Utiliser `React.cache()` pour dédupliquer les appels dans un même rendu
  - Données : solde total, solde courants/épargnes séparés, revenus/dépenses du mois, différence nette, total virements + détail, solde prévisionnel, données 6 mois pour graphique, répartition par catégorie, 5 dernières transactions, alertes budgets actives
- [ ] **Solde prévisionnel** : solde total actuel + somme des récurrences de type revenu attendues avant fin de mois - somme des récurrences de type dépense attendues avant fin de mois

---

### Issue 12.2 — Page Dashboard

**Labels** : `epic:dashboard`, `type:feature`

**Dépendances** : Issue 12.1, Issue 2.2

**Tâches**
- [ ] Page `app/(app)/page.tsx`
- [ ] Architecture Suspense : chaque section dans son `<Suspense fallback={<Skeleton />}>` pour streamer
- [ ] Bloc solde : `AnimatedAmount` prominent
- [ ] Graphique revenus/dépenses : bar chart Recharts, `next/dynamic` pour ne pas bloquer le bundle
- [ ] Graphique anneau : donut chart Recharts, `next/dynamic`
- [ ] Ligne virements : accordéon visuellement neutre (pas de couleur sémantique)
- [ ] Sélecteur de période : semaine / mois / trimestre / année / personnalisée
- [ ] Composant `OnboardingChecklist` (voir Epic 14)

---

## Epic 13 — Paramètres

### Issue 13.1 — Page Paramètres

**Labels** : `epic:settings`, `type:feature`

**Dépendances** : Issue 1.3, Issue 1.5, Issue 3.2

**Tâches**
- [ ] Page `app/(app)/settings/page.tsx` avec navigation par sections
- [ ] **Profil** : prénom, nom, email (Server Action `updateProfile`), upload photo (Better Upload → URL stockée en base)
- [ ] **Préférences** : devise (select, défaut EUR, `Intl.NumberFormat` pour le formatage global), thème
- [ ] **Catégories** : lien vers Issue 6.2
- [ ] **Données** :
  - Export CSV : Server Action qui génère et retourne un CSV via `Response` avec header `Content-Disposition`
  - Suppression compte : dialog + saisie du mot "SUPPRIMER" + Server Action `deleteUserAccount` (cascade Prisma)
- [ ] **Aide** : bouton "Revoir le tutoriel" → remet `OnboardingProgress` à zéro + redirect `/onboarding`

---

### Issue 13.2 — Formatage global de la devise

**Labels** : `epic:settings`, `type:feature`

**Dépendances** : Issue 13.1

**Tâches**
- [ ] Helper `formatAmount(amount, currency)` dans `lib/utils/format.ts` utilisant `Intl.NumberFormat`
- [ ] Context `CurrencyContext` qui expose la devise de l'utilisateur, initialisé dans le layout `(app)`
- [ ] Tous les montants dans l'app passent par `formatAmount` — aucun formatage ad-hoc

---

## Epic 14 — Onboarding

### Issue 14.1 — Flow d'onboarding initial

**Labels** : `epic:onboarding`, `type:feature`

**Dépendances** : Issue 5.1, Issue 3.1

**Tâches**
- [ ] Route `app/(onboarding)/onboarding/page.tsx` avec stepper 2 étapes
- [ ] **Étape 1 — Bienvenue** : message personnalisé, phrase de présentation, bouton "Commencer"
- [ ] **Étape 2 — Premier compte courant** : nom du compte, solde actuel (type forcé à CHECKING)
  - Server Action : crée le compte + `prisma.onboardingProgress.create` avec étape 1 cochée
- [ ] Redirect vers `/(app)` après completion
- [ ] Guard : si l'utilisateur a déjà un compte → redirect vers le dashboard

---

### Issue 14.2 — Checklist de démarrage

**Labels** : `epic:onboarding`, `type:feature`

**Dépendances** : Issue 14.1, Issue 12.2

**Tâches**
- [ ] Composant `OnboardingChecklist` sur le dashboard :
  - Indicateur "X / 7 étapes", barre de progression globale
  - 7 étapes cliquables avec état coché (depuis `OnboardingProgress.checklistCompleted`)
  - Bouton "Masquer" → `checklistDismissed = true`
  - Disparaît quand toutes les étapes sont complétées OU masquée
- [ ] Chaque Server Action métier correspondante appelle `markChecklistStep(userId, step)` :
  - `createAccount(SAVINGS)` → étape "savings"
  - `updateProfile` → étape "profile"
  - `createCategory` → étape "categories"
  - `createTransaction(EXPENSE)` → étape "first-expense"
  - `createBudget` → étape "budget"
  - `createGoal` → étape "goal"

---

### Issue 14.3 — Tooltips de découverte contextuelle

**Labels** : `epic:onboarding`, `type:feature`

**Dépendances** : Issue 14.1

**Tâches**
- [ ] Composant `DiscoveryTooltip` : popover non-bloquant, fermeture au clic ailleurs, style `.glass-popover`
- [ ] Tooltips sur : Transactions, Budgets, Objectifs, Paramètres
- [ ] Au premier rendu de chaque page : check `tooltipsSeen` dans `OnboardingProgress`, si absent → afficher après 500ms
- [ ] Server Action `markTooltipSeen(page)` déclenché au premier affichage

---

## Epic 15 — PWA

### Issue 15.1 — Configuration PWA

**Labels** : `epic:pwa`, `type:feature`

**Dépendances** : Issue 3.1

**Tâches**
- [ ] Configurer le Service Worker (via `next-pwa` ou implémentation manuelle)
- [ ] `public/manifest.json` :
  - `name`: "Motion Finance", `short_name`: "Motion", `display`: "standalone"
  - `theme_color` : violet/indigo principal
  - Icônes 192×192 et 512×512 maskable
  - Shortcuts : "Ajouter une transaction" (`/?action=add-transaction`) et "Voir le dashboard" (`/`)
- [ ] Service Worker : Cache First pour assets statiques, Network First pour les données
- [ ] **Bannière d'installation** : composant `InstallBanner`, affiché une seule fois sur mobile via `beforeinstallprompt`, dismiss dans `localStorage`
- [ ] Gestion `?action=add-transaction` : ouvre automatiquement `TransactionFormSheet` au chargement
- [ ] **Mode offline** : bandeau informatif si `navigator.onLine === false`

---

## Ordre d'implémentation

```
Epic 1 (Setup)
  → Epic 2 (Design System)   ← en parallèle dès le début
  → Epic 3 (Layout)
  → Epic 4 (Auth)
  → Epic 5 (Comptes)
  → Epic 6 (Catégories)
  → Epic 7 (Transactions)
  → Epic 8 (Récurrentes)
  → Epic 9 (Budgets)
  → Epic 10 (Objectifs)
  → Epic 11 (Notifications)
  → Epic 12 (Dashboard)
  → Epic 13 (Paramètres)
  → Epic 14 (Onboarding)
  → Epic 15 (PWA)
```
