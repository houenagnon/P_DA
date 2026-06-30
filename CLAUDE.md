# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Data Afrique Hub (DAH)** — portail officiel de gestion de la communauté Data Afrique Hub.

Ce projet est en cours de **refonte complète** depuis un prototype (Node.js/Express + HTML vanilla) vers une architecture moderne :
- **Backend cible** : Django 5 + DRF + PostgreSQL + Celery + Redis
- **Frontend cible** : Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui

Le code dans `backend/` et `front/` est l'ancien prototype, conservé **uniquement comme référence métier**. Le nouveau code sera dans `backend/` (Django) et `frontend/` (Next.js).

---

## État actuel du projet (prototype de référence)

### Backend (`backend/`) — Node.js/Express + MySQL

```bash
cd backend
npm install
npm start          # démarre sur le port 3001 (nodemon, auto-reload)
npm run start:prod # production
```

**Prérequis** : XAMPP ou MariaDB/MySQL actif, base `DAH_BD` créée manuellement. Les tables sont créées automatiquement via `Sequelize sync({ alter: true })` au démarrage.

Variables d'environnement (`backend/.env`) : `PORT`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_LIFETIME`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

**Schéma SQL de référence** : `backend/config/DAH_BD_Updated.sql`

### Frontend (`front/`) — HTML/CSS/JS vanilla + Tailwind

```bash
cd front
npm install
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
# Ouvrir index.html dans le navigateur
```

---

## Architecture actuelle (prototype)

### Backend — flux de données

```
app.js
  ├── POST /login → loginValidator → authController.login
  └── /api → routesGenerale.js
        ├── /events    → EventsRoutes   → EventController
        ├── /participation → ParticipationRoutes → ParticipationController
        ├── /testimonials  → TestimonialsRoutes  → TestimonialsController
        ├── /comptes       → compteRoutes        → compteController
        └── /users         → UsersRoutes         → UserController
```

**Authentification** : JWT (access token 1h + refresh token 30j en cookie httpOnly). Middleware de vérification : `Controllers/JWTController.js → verifyAccessToken`.

**Upload fichiers** : Multer → `uploads/images_events/`, `uploads/images_testimonials/`, `uploads/others/`. Les fichiers uploadés sont servis statiquement depuis la racine.

**Modèles Sequelize** (relations définies dans `Models/init-models.js`) :
- `Personne` ↔ `Compte` (OneToOne via `id_personne`)
- `Personne` ↔ `Evenement` via `Participe` (participation événements)
- `Personne` ↔ `Organisme` via `Appartenance_organisme`
- `Personne` ↔ `Evenement` via `Intervenant` (intervenants)
- `Personne` → `Association` → `Poste_association`
- `Departement` ↔ `Personne` via `Compo_departement`

⚠️ `Models/User.js` et `Models/Personne.js` définissent la même table — `User.js` est un doublon à ignorer.

### Frontend — pages et scripts

| Page | Route | Script |
|------|-------|--------|
| Accueil | `/` | `src/main.js`, `src/fetchData.js` |
| À propos | `/about/` | inline |
| Événements | `/events/` | `src/scripts/events.js` + `src/scripts/fetchEventsData.js` |
| Détail événement | `/event/?id=<uuid>` | `src/scripts/event.js` |
| Partenaires | `/partenaire/` | inline (EmailJS) |

`src/fetchData.js` appelle Sanity CMS (projet `otqb5lj1`). `src/scripts/fetchEventsData.js` contient des données mockées hardcodées — les deux sources coexistent sans cohérence.

**Palette de couleurs DAH** :
- `primary` : `#04041A` (fond navy)
- `blue` : `#0972E1` (bleu marque)
- `yellow` : `#FF8A00` (orange accent)
- Police : Poppins (Google Fonts)
- Classes Tailwind custom : `font-poppins`, `bg-blue`, `bg-yellow`, `bg-primary`

---

## Architecture cible (refonte en cours)

### Structure de dossiers

```
DAH_P/
├── backend/           # Django (nouvelle version)
│   ├── config/        # settings/, urls.py, wsgi.py, asgi.py
│   ├── apps/
│   │   ├── accounts/      # User custom + JWT + RBAC
│   │   ├── members/       # Profils membres
│   │   ├── events/        # Événements + QR codes
│   │   ├── memberships/   # Workflow d'adhésion
│   │   ├── payments/      # Cotisations
│   │   ├── certificates/  # Certificats PDF
│   │   ├── departments/   # Départements
│   │   ├── documents/     # GED légère
│   │   ├── notifications/ # Centre notifications
│   │   ├── portfolios/    # Portfolios publics
│   │   ├── blog/          # CMS articles
│   │   ├── projects/      # Projets communautaires
│   │   └── common/        # Permissions RBAC, mixins
│   └── requirements/
│       ├── base.txt       # Django, DRF, JWT, Celery, etc.
│       ├── dev.txt
│       └── prod.txt
│
├── frontend/          # Next.js 15 (nouvelle version)
│   ├── app/
│   │   ├── (public)/      # Pages publiques sans auth
│   │   ├── (auth)/        # Login, register, reset-password
│   │   └── (dashboard)/   # Pages protégées (sidebar)
│   ├── features/      # Modules fonctionnels (auth/, members/, events/…)
│   ├── services/      # Couche API Axios (*.service.ts)
│   ├── hooks/         # Custom React hooks
│   ├── types/         # Types TypeScript partagés
│   ├── lib/           # axios.ts, query-client.ts, auth.ts
│   └── utils/
│
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

### Rôles utilisateur (RBAC)

```
admin | president | vp1 | vp2 | secretaire_general | secretaire_general_adj
tresorier | tresorier_adj | responsable_departement | formateur | mentor
membre | candidat | visiteur
```

Permissions définies dans `apps/common/permissions.py` : `IsAdmin`, `IsBureau`, `IsMembre`, `IsOwnerOrAdmin`.

### API versionnée

Tous les endpoints Django sont préfixés `/api/v1/`. Documentation Swagger auto-générée par `drf-spectacular` sur `/api/docs/`.

### Conventions de code (nouveau code)

**Backend Django :**
- Services métier dans `apps/<module>/services.py`, séparés des views
- Validation uniquement dans les serializers, jamais dans les views
- Héritage de `ModelViewSet` ou `GenericAPIView`

**Frontend Next.js :**
- Un fichier `*.service.ts` par domaine dans `services/`
- TanStack Query pour tout fetching/caching — pas de `useState` + `useEffect` pour les données API
- Zod + React Hook Form pour tous les formulaires
- Skeleton loaders systématiques pendant le chargement
