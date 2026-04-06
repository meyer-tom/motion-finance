# Motion Finance — Contexte projet

Application web de gestion des finances personnelles. PWA installable sur mobile et desktop.

## Stack technique

| Rôle | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Base de données | PostgreSQL sur Neon (intégration Vercel) |
| ORM | Prisma |
| Auth | Better Auth |
| Emails | Resend |
| Upload | Better Upload |
| Déploiement | Vercel |
| Linting/Formatting | Ultracite (preset zéro-config ESLint + Biome + Prettier) |
| UI | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Graphiques | Recharts |
| Police | Geist (unique sur toute l'app) |

## Design

Interface standard **shadcn/ui** — composants opaques classiques.

**Couleurs sémantiques** (tokens CSS définis dans `globals.css`) :
- Accent principal : `--color-accent` Violet / Indigo
- Revenus : `--color-income` Vert
- Dépenses : `--color-expense` Rouge
- Virements : `--color-transfer` Bleu ciel

Les badges `income`, `expense`, `transfer` sont disponibles nativement dans `Badge`.
La Progress bar accepte `--progress-color` en CSS var inline pour les couleurs sémantiques.

**Thème** : clair/sombre/automatique (suit le système par défaut). Les deux thèmes doivent être entièrement soignés.

**Navigation** :
- Mobile : barre en bas (5 entrées max), formulaires en bottom sheet
- Desktop : sidebar fixe à gauche

## Phases de déploiement

- **Phase 1** (en cours) : usage personnel, un seul utilisateur
- **Phase 2** : usage familial, invitations avec rôles, OAuth Google
- **Phase 3** : ouverture publique

## Fonctionnalités principales

### Comptes financiers
- Types : Courant / Épargne
- Solde calculé dynamiquement (solde de départ + transactions) — jamais saisi manuellement après création
- Couleur et icône personnalisables

### Transactions
- Types : Dépense / Revenu / Virement
- Les **virements sont exclus des statistiques** (ni dépense ni revenu)
- Champs : type, montant, date, description (optionnelle), catégorie, compte, tags libres
- Liste avec **infinite scroll**, filtres complets, recherche textuelle

### Transactions récurrentes
- Modèles configurables (loyer, abonnements, salaire…)
- **Jamais ajoutées automatiquement** — uniquement des suggestions de pré-remplissage dans le formulaire, triées par probabilité

### Catégories
- Catégories système pré-chargées : masquables mais **non supprimables**
- Catégories personnalisées : créer/modifier/supprimer
- Règle : la catégorie décrit la **nature du paiement**, pas le domaine de vie (ex: abonnement salle de sport → "Abonnements", achat chaussures running → "Sport")

### Budgets
- Plafond mensuel par catégorie
- Barre de progression : verte <60%, orange 60-90%, rouge >90%
- Alertes in-app à 80% (avertissement) et 100% (dépassement)
- Reconduction mensuelle : **toujours une suggestion**, jamais automatique

### Objectifs d'épargne
- Montant mis à jour manuellement par l'utilisateur
- Calcul automatique du montant mensuel à épargner si date limite définie
- Récompense à 100% : confettis + vibration mobile + badge "Complété"
- Objectifs complétés archivés dans un onglet dédié

### Dashboard
- Solde total (prominent), solde courant(s) et épargne séparés
- Revenus vs dépenses du mois + différence nette
- Solde prévisionnel de fin de mois (transactions récurrentes attendues)
- Graphique revenus/dépenses sur 6 mois
- Répartition dépenses par catégorie (anneau)
- 5 dernières transactions
- Alertes actives (budgets)
- Ligne "Virements ce mois" visuellement neutre (hors blocs revenus/dépenses)
- Filtre période : semaine / mois / trimestre / année / personnalisée

### Notifications in-app
- Icône cloche dans le header, badge rouge non-lues
- Panneau popover standard
- Déclencheurs : budget à 80%, budget dépassé, objectif atteint, récurrente à échéance

### Paramètres
- Profil : prénom, nom, email, photo (Better Upload)
- Préférences : devise (défaut EUR), thème
- Catégories personnalisées
- Export CSV des transactions
- Suppression définitive du compte
- Relancer l'onboarding

## Onboarding
1. Écran de bienvenue
2. Création du premier compte courant (obligatoire)
3. Dashboard + checklist de démarrage (7 étapes, disparaît quand complétée ou masquée)
4. Tooltips contextuels non-bloquants à la première visite de chaque page principale

## PWA
- Bannière d'installation à la première visite mobile
- Raccourcis : "Ajouter une transaction" et "Voir le dashboard"
- Mode offline : lecture seule des dernières données consultées

## Micro-interactions & Gamification
- Montants animés (effet compteur progressif)
- Barres de progression animées à l'entrée
- Squelettes (skeletons) pour les chargements, pas de spinners
- Confettis + vibration mobile à l'atteinte d'un objectif d'épargne
- Vibration légère sur mobile pour suppressions/validations importantes

## Règles de gestion critiques

| Règle | Détail |
|---|---|
| Solde calculé dynamiquement | Jamais saisi manuellement après création |
| Virements exclus des stats | Pas dans graphiques ni totaux mensuels |
| Transactions récurrentes manuelles | Suggestions uniquement, jamais auto |
| Budgets non reconduits auto | Toujours une suggestion utilisateur |
| Catégories système non supprimables | Masquables uniquement |
| Données isolées par utilisateur | Isolation stricte en base |
