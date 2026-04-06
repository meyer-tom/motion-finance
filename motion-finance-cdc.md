# Motion Finance — Cahier des Charges

> Version destinée aux profils métier et à l'équipe de développement.
> Ce document décrit le produit, ses fonctionnalités et ses règles de gestion.
> Les choix d'implémentation technique détaillés seront définis dans les issues séparément.

---

## 1. Présentation du projet

**Nom de l'application** : Motion Finance
**Type** : Application web installable sur mobile et desktop (PWA)
**Objectif** : Permettre à un utilisateur de gérer ses finances personnelles de manière claire, moderne et motivante — suivi des revenus et dépenses, gestion de budgets par catégorie, objectifs d'épargne, et tableaux de bord analytiques.

### Phases de déploiement

- **Phase 1** : Usage personnel — un seul utilisateur (le propriétaire de l'instance)
- **Phase 2** : Usage familial — invitation de membres proches, espaces partagés ou séparés
- **Phase 3** : Ouverture au public — tout utilisateur peut s'inscrire

Ce document couvre principalement la Phase 1, avec des mentions explicites des fonctionnalités prévues pour les phases suivantes.

---

## 2. Stack technique

> Résumé des technologies retenues. Les détails d'implémentation sont définis dans les issues.

| Rôle | Technologie choisie |
|---|---|
| Framework web | Next.js 16 |
| Base de données | PostgreSQL hébergé sur Neon (intégration Vercel) |
| Authentification | Better Auth |
| Emails transactionnels | Resend |
| Upload de fichiers | Better Upload |
| Déploiement | Vercel |
| Design / UI | Tailwind CSS + shadcn/ui |
| Graphiques | Recharts |

---

## 3. Design & Expérience utilisateur

### 3.1 Identité visuelle

L'application doit donner une impression de **modernité premium**. L'argent est un sujet qui peut être source d'anxiété — l'interface doit rassurer, motiver et rendre la gestion financière agréable.

**Style** : interface standard **shadcn/ui** — composants opaques classiques.

**Couleurs sémantiques** (tokens CSS définis dans `globals.css`) :

| Usage | Token | Valeur |
|---|---|---|
| Accent principal | `--color-accent` | Violet / Indigo |
| Revenus | `--color-income` | Vert |
| Dépenses | `--color-expense` | Rouge |
| Virements | `--color-transfer` | Bleu ciel |

Les badges `income`, `expense`, `transfer` sont disponibles nativement dans le composant `Badge`. La `Progress` bar accepte `--progress-color` en CSS var inline pour les couleurs de budgets.

### 3.2 Couleurs

| Usage | Couleur |
|---|---|
| Accent principal de l'app | Violet / Indigo |
| Revenus | Vert |
| Dépenses | Rouge |
| Virements entre comptes | Bleu ciel |

### 3.3 Thème clair / sombre

- Par défaut, l'application adopte automatiquement le thème du système de l'utilisateur (clair ou sombre).
- L'utilisateur peut forcer un thème manuellement depuis le header et depuis les paramètres : trois options — Clair, Sombre, Automatique.
- Les deux thèmes doivent être entièrement fonctionnels et soignés.

### 3.4 Typographie

Police unique sur toute l'application : **Geist**, moderne et très lisible, y compris sur mobile et petites tailles.

### 3.5 Navigation

- **Sur mobile** : barre de navigation en bas de l'écran (5 entrées maximum). Les formulaires d'ajout s'ouvrent dans un panneau qui glisse depuis le bas (Sheet).
- **Sur desktop** : sidebar fixe à gauche.
- Les menus déroulants, popovers et panneaux utilisent les composants Radix standard (Dropdown, Popover, Dialog, Sheet).

### 3.6 Micro-interactions et gamification

L'interface doit être vivante et récompenser l'utilisateur :

- Les montants s'animent lors de leur affichage (effet de compteur progressif).
- Les barres de progression (budgets, objectifs) s'animent à l'entrée de la page.
- Quand un objectif d'épargne est atteint : une pluie de confettis s'affiche à l'écran, une vibration légère est déclenchée sur mobile, et une notification de succès apparaît.
- Les chargements utilisent des squelettes (forme grisée de l'élément attendu) plutôt que des indicateurs de chargement rotatifs.
- Les actions de suppression ou de validation importantes déclenchent une légère vibration sur mobile.

### 3.7 Accessibilité mobile

L'application est conçue mobile en priorité. Toutes les pages doivent être utilisables sur un smartphone standard. L'ajout d'une transaction doit être accessible en moins de deux interactions depuis n'importe quelle page de l'application.

---

## 4. Authentification & Comptes utilisateurs

### 4.1 Inscription

L'utilisateur renseigne les champs suivants lors de la création de son compte :
- Prénom
- Nom
- Adresse email
- Mot de passe (avec confirmation)

### 4.2 Connexion

- Email + mot de passe
- Option "Rester connecté"

### 4.3 Réinitialisation du mot de passe

L'utilisateur peut demander un lien de réinitialisation envoyé à son adresse email. Les emails sont envoyés via **Resend**.

### 4.4 Fonctionnalités futures (Phase 2)

- Connexion via Google (OAuth)
- Système d'invitation familiale avec rôles

---

## 5. Comptes financiers

Un utilisateur peut créer plusieurs comptes financiers pour refléter sa situation réelle (compte courant, livret d'épargne, etc.).

### 5.1 Types de comptes disponibles

- **Courant** : compte du quotidien, pour les dépenses et revenus réguliers
- **Épargne** : livret, épargne logement, etc.

### 5.2 Informations d'un compte

- Nom du compte (ex : "Compte principal", "Livret A")
- Type (Courant ou Épargne)
- Solde de départ au moment de la création
- Couleur et icône personnalisées pour le distinguer visuellement

### 5.3 Calcul du solde

Le solde affiché d'un compte est toujours calculé en temps réel à partir du solde de départ et de l'ensemble des transactions associées. Il ne peut pas être saisi ou modifié manuellement après la création du compte.

### 5.4 Affichage sur le dashboard

- Le **solde total** (tous comptes confondus) est affiché en position centrale et prominente.
- En dessous, le solde du ou des comptes courants et le solde total des comptes épargne sont affichés séparément pour une lecture claire.

---

## 6. Transactions

Les transactions sont le cœur de l'application — chaque entrée ou sortie d'argent est enregistrée ici.

### 6.1 Types de transactions

- **Dépense** : argent qui sort d'un compte
- **Revenu** : argent qui entre dans un compte
- **Virement** : déplacement d'argent entre deux comptes de l'utilisateur — ce n'est ni une dépense ni un revenu, et ce type est exclu des statistiques

### 6.2 Informations d'une transaction

- Type (Dépense, Revenu ou Virement)
- Montant
- Date
- Description (optionnelle)
- Catégorie (pour les dépenses et revenus)
- Compte concerné (ou comptes source et destination pour un virement)
- Tags libres : mots-clés personnalisés que l'utilisateur peut ajouter librement (ex : "Vacances 2025", "Projet maison") pour filtrer ou regrouper des transactions sans créer de catégorie formelle

### 6.3 Affichage de la liste

- Triées par date, de la plus récente à la plus ancienne
- Chargement par infinite scroll (les transactions se chargent au fur et à mesure du défilement)
- Filtres disponibles : période, catégorie, compte, type, montant minimum/maximum, tags
- Recherche textuelle sur la description

### 6.4 Virements

Les virements sont affichés dans l'historique avec un style visuel distinct (couleur bleu ciel, icône de transfert avec compte source → compte destination). Ils ne sont jamais comptabilisés dans les statistiques de revenus ou de dépenses.

---

## 7. Transactions récurrentes

Certaines transactions se répètent régulièrement : loyer, abonnements, salaire, remboursements. L'application permet d'enregistrer ces modèles pour accélérer la saisie.

### 7.1 Ce que l'utilisateur configure

Pour chaque récurrence, il renseigne :
- Nom / description (ex : "Loyer", "Netflix", "Salaire")
- Montant habituel
- Catégorie
- Compte concerné
- Fréquence indicative (hebdomadaire, mensuelle, trimestrielle, annuelle)

### 7.2 Fonctionnement — suggestions de pré-remplissage

Les transactions récurrentes **ne sont jamais ajoutées automatiquement** — c'est toujours l'utilisateur qui décide.

Lorsqu'il ouvre le formulaire d'ajout de transaction, une section "Suggestions" liste toutes ses transactions récurrentes actives. Elles sont triées par ordre de probabilité : celles dont la date habituelle est la plus proche de la date du jour apparaissent en premier. Un clic sur une suggestion pré-remplit entièrement le formulaire, que l'utilisateur peut modifier avant de valider.

---

## 8. Catégories

Les catégories permettent de classifier les transactions pour analyser les habitudes de dépenses et de revenus.

### 8.1 Règle de catégorisation

La catégorie décrit la **nature du paiement**, pas le domaine de vie. Par exemple :
- Un abonnement à une salle de sport → **Abonnements** (prélèvement récurrent automatique)
- L'achat de chaussures de running → **Sport** (achat ponctuel)

Une explication courte est affichée dans l'interface pour guider l'utilisateur en cas de doute.

### 8.2 Catégories par défaut

Pré-chargées pour tous les utilisateurs dès la création du compte. Elles ne peuvent pas être supprimées, mais peuvent être masquées individuellement.

**Dépenses** : Alimentation, Restaurants & Cafés, Transport, Logement, Santé, Loisirs, Shopping, Abonnements, Éducation, Sport, Voyages, Cadeaux, Divers

**Revenus** : Salaire, Freelance, Remboursement, Investissements, Autres revenus

### 8.3 Catégories personnalisées

L'utilisateur peut créer ses propres catégories avec un nom, une icône et une couleur, et choisir si elles s'appliquent aux dépenses ou aux revenus. Elles peuvent être modifiées et supprimées à tout moment.

---

## 9. Budgets

Les budgets permettent de fixer un plafond de dépenses mensuel par catégorie et de suivre sa consommation en temps réel.

### 9.1 Fonctionnement

L'utilisateur définit un montant maximum à dépenser dans une catégorie pour un mois donné. Le montant réellement dépensé est calculé automatiquement à partir des transactions du mois. Une barre de progression indique l'avancement :
- Verte en dessous de 60%
- Orange entre 60% et 90%
- Rouge au-delà de 90%

### 9.2 Alertes

- À 80% de consommation d'un budget → notification in-app d'avertissement
- À 100% ou plus → notification in-app de dépassement

### 9.3 Reconduction mensuelle

Si aucun budget n'est défini pour le mois en cours, l'application propose à l'utilisateur de reprendre les budgets du mois précédent. C'est toujours une suggestion — jamais une action automatique.

---

## 10. Objectifs d'épargne

Les objectifs permettent à l'utilisateur de se fixer un cap financier et de visualiser sa progression de manière motivante.

### 10.1 Informations d'un objectif

- Nom (ex : "Voyage au Japon", "Nouvelle voiture")
- Montant cible
- Montant déjà épargné (mis à jour manuellement par l'utilisateur)
- Date limite (optionnelle)
- Compte épargne associé (optionnel)

### 10.2 Suivi et récompenses

- Barre de progression visuelle avec pourcentage affiché.
- Si une date limite est définie : calcul automatique du montant à mettre de côté chaque mois pour atteindre l'objectif à temps.
- Quand l'objectif est atteint à 100% : pluie de confettis à l'écran, vibration sur mobile, notification de succès et badge "Complété".
- Les objectifs complétés sont archivés dans un onglet dédié (ils restent visibles mais séparés des objectifs actifs).

---

## 11. Tableau de bord (Dashboard)

La page d'accueil après connexion. Elle offre une vision d'ensemble instantanée de la situation financière.

### 11.1 Éléments affichés

- Solde total tous comptes confondus — affiché en grand, position centrale
- Solde des comptes courants et solde total des comptes épargne — affichés séparément en dessous
- Revenus du mois vs dépenses du mois, avec la différence nette
- Solde prévisionnel de fin de mois — calculé en ajoutant les transactions récurrentes attendues dans le reste du mois
- Graphique comparant revenus et dépenses mois par mois sur les 6 derniers mois
- Répartition des dépenses du mois par catégorie (graphique en anneau)
- Les 5 dernières transactions
- Alertes actives (budgets dépassés ou proches du seuil)
- Ligne informative "Virements ce mois" affichant le total des montants transférés entre comptes — affichée en dehors des blocs revenus/dépenses, visuellement neutre (pas de couleur sémantique), avec le détail des virements accessible au clic (ex : "Courant → Livret A : 200€")

### 11.2 Filtres

La période analysée peut être ajustée : semaine, mois, trimestre, année, ou période personnalisée.

---

## 12. Notifications in-app

Un centre de notifications est accessible depuis une icône cloche dans le header de l'application. Un badge rouge indique le nombre de notifications non lues.

### 12.1 Types de notifications générées automatiquement

| Déclencheur | Type |
|---|---|
| Budget consommé à 80% | Avertissement |
| Budget dépassé | Danger |
| Objectif d'épargne complété | Succès |
| Transaction récurrente arrivant à échéance | Information |

### 12.2 Interactions

- Le panneau de notifications s'ouvre en style Liquid Glass depuis la cloche du header.
- Chaque notification peut être marquée comme lue individuellement, ou toutes d'un seul geste.
- Les notifications restent visibles jusqu'à être lues ou supprimées manuellement.

---

## 13. Paramètres

### 13.1 Profil

- Modifier son prénom, nom et adresse email
- Ajouter ou modifier une photo de profil (upload d'image via Better Upload)

### 13.2 Préférences

- Devise d'affichage : choix parmi les principales devises internationales (défaut : EUR)
- Thème : Clair / Sombre / Automatique

### 13.3 Catégories

Accès direct à la gestion des catégories personnalisées (création, modification, suppression).

### 13.4 Données personnelles

- Export de l'ensemble des transactions au format CSV
- Suppression définitive du compte et de toutes les données associées (avec confirmation explicite)

### 13.5 Aide

- Bouton "Revoir le tutoriel" qui relance la séquence d'onboarding depuis le début.

---

## 14. Onboarding — Prise en main

L'onboarding est conçu pour guider sans bloquer. Il repose sur trois niveaux complémentaires qui s'enchaînent naturellement.

### 14.1 Onboarding initial (première connexion uniquement)

Très court — deux étapes seulement, puis l'utilisateur est libre d'explorer.

**Étape 1 — Bienvenue** : écran de bienvenue avec le prénom de l'utilisateur, une phrase d'accroche présentant Motion Finance, et un bouton pour démarrer.

**Étape 2 — Créer son premier compte courant** : l'utilisateur saisit le nom de son compte et son solde actuel. Cette étape est obligatoire — sans compte, le dashboard est vide et l'application inutilisable.

Après ces deux étapes, l'utilisateur accède directement au dashboard avec sa checklist de démarrage.

### 14.2 Checklist de démarrage (visible sur le dashboard)

Une carte affiche la progression de découverte avec des actions suggérées et un indicateur de complétion (ex : "3 / 6 étapes"). Elle disparaît une fois toutes les étapes complétées ou si l'utilisateur choisit de la masquer.

Étapes de la checklist, dans l'ordre recommandé :
1. ✅ Créer son compte courant *(fait lors de l'onboarding)*
2. Personnaliser son profil — photo de profil, devise, thème
3. Ajouter un compte épargne
4. Personnaliser ses catégories
5. Ajouter sa première dépense
6. Créer un budget mensuel
7. Définir un objectif d'épargne

### 14.3 Tooltips de découverte contextuelle

La première fois que l'utilisateur visite chaque page principale, un tooltip discret met en avant l'action principale de la page. Ces tooltips sont non-bloquants (fermeture en cliquant ailleurs) et ne réapparaissent pas une fois vus.

Exemples :
- Sur la page Transactions : "Appuyez sur + pour ajouter votre première transaction."
- Sur la page Budgets : "Définissez un plafond par catégorie pour mieux contrôler vos dépenses."
- Sur la page Objectifs : "Créez un objectif pour visualiser votre chemin vers un projet ou un achat."

### 14.4 Relance du tutoriel

L'ensemble de l'onboarding peut être relancé à tout moment depuis Paramètres > Aide > "Revoir le tutoriel".

---

## 15. Application installable (PWA)

Motion Finance peut être installée directement sur l'écran d'accueil d'un smartphone ou d'un ordinateur, comme une application native, sans passer par un store.

- Une bannière discrète propose l'installation lors de la première visite sur mobile.
- Une fois installée, l'application s'ouvre sans interface de navigateur visible.
- Raccourcis disponibles depuis l'icône de l'app : "Ajouter une transaction" et "Voir le dashboard".
- Sans connexion internet : les dernières données consultées restent accessibles en lecture. Un message informe l'utilisateur qu'il est hors ligne et que les modifications reprendront dès le retour de la connexion.

---

## 16. Emails transactionnels

Les emails envoyés par l'application sont gérés via **Resend**.

| Email | Déclencheur |
|---|---|
| Réinitialisation du mot de passe | Demande de l'utilisateur |
| Confirmation d'inscription | À la création du compte *(Phase 2)* |
| Invitation familiale | Envoi d'une invitation *(Phase 2)* |

---

## 17. Règles de gestion importantes

| Règle | Détail |
|---|---|
| Solde calculé dynamiquement | Le solde d'un compte est toujours recalculé à partir de ses transactions — jamais saisi manuellement après création |
| Virements exclus des statistiques | Un virement entre deux comptes n'est ni une dépense ni un revenu et n'apparaît pas dans les graphiques ni les totaux mensuels |
| Transactions récurrentes manuelles | Aucune transaction n'est jamais ajoutée automatiquement — les récurrentes sont uniquement des suggestions de pré-remplissage |
| Budgets non reconduits automatiquement | La reconduction mensuelle est toujours une suggestion soumise à validation de l'utilisateur |
| Catégories système non supprimables | Les catégories pré-chargées peuvent être masquées mais pas supprimées |
| Données isolées par utilisateur | Les données d'un utilisateur ne sont jamais accessibles par un autre |

---

## 18. Ce qui sera défini dans les issues

Les points suivants seront traités dans les issues de développement, organisées par Epics avec ordre de priorité d'implémentation :

- Modèle de données complet
- Choix des bibliothèques et versions précises
- Découpage technique des composants et pages
- Logique de calcul du solde prévisionnel
- Gestion des erreurs et cas limites
- Stratégie de cache et performance
- Structure complète des dossiers du projet
