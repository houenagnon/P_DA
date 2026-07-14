# Récapitulatif — Refonte DAH (Data Afrique Hub)

> **Date** : juin 2026  
> **Stack** : Django 5 + DRF (backend) · Next.js 15 + TypeScript + Tailwind (frontend)  
> **Statut** : MVP fonctionnel — toutes les pages liées à l'API sont implémentées

---

## Backend (Django)

### Infrastructure

- **Docker** : `docker-compose.yml` + `docker-compose.dev.yml` avec services `db` (PostgreSQL 16), `redis`, `backend`, `frontend`
- **Settings** : `config/settings/base.py` + `dev.py` — JWT, CORS, Celery, drf-spectacular, django-filter
- **Sécurité** : `SECURE_BROWSER_XSS_FILTER`, `X_FRAME_OPTIONS`, `SECURE_CONTENT_TYPE_NOSNIFF`, rate-limiting configuré
- **Documentation API** : Swagger auto-généré via `drf-spectacular` sur `/api/docs/`
- **Seed** : `python manage.py seed_dah` — crée 11 utilisateurs, profils complets, événements, adhésions

### App `accounts` — Authentification & RBAC

**Modèle `User` custom** (`AbstractBaseUser`) :
- Champs : `email` (unique), `first_name`, `last_name`, `phone`, `avatar`, `email_verified`, `role`, `is_active`, `is_staff`
- 14 rôles : `admin`, `president`, `vp1`, `vp2`, `secretaire_general`, `secretaire_general_adj`, `tresorier`, `tresorier_adj`, `responsable_departement`, `formateur`, `mentor`, `membre`, `candidat`, `visiteur`

**Endpoints** (`/api/v1/auth/`) :

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register/` | Inscription (crée profil membre automatiquement) |
| POST | `/login/` | JWT access (1h) + refresh (30j) |
| POST | `/token/refresh/` | Renouvellement access token |
| POST | `/logout/` | Blacklist du refresh token |
| GET | `/me/` | Profil utilisateur connecté |
| PATCH | `/me/` | Modifier ses infos (nom, téléphone) |
| POST | `/password/change/` | Changer le mot de passe (authentifié) |
| POST | `/password/reset/` | Demande reset par email |
| POST | `/password/reset/confirm/` | Confirmer reset avec token |
| POST | `/email/verify/` | Vérifier email avec token |

**Permissions RBAC** (`apps/common/permissions.py`) :
- `IsAdmin`, `IsAdminOrBureau`, `IsMembre`, `IsOwnerOrAdmin`

### App `members` — Profils membres

**Modèles** : `MemberProfile`, `MemberExperience`, `MemberCertification`, `SocialLink`

**Endpoints** (`/api/v1/members/`) :

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Admin/Bureau | Liste complète des membres |
| GET | `/public/` | Public | Liste publique (profils `is_public=True`, hors admin/visiteur) avec `current_job` |
| GET | `/public/<slug>/` | Public | Profil public détaillé (portfolio) |
| GET/PATCH | `/me/profile/` | Authentifié | Mon profil |
| CRUD | `/me/experiences/` | Authentifié | Mes expériences |
| CRUD | `/me/certifications/` | Authentifié | Mes certifications |
| CRUD | `/me/social-links/` | Authentifié | Mes liens sociaux |

**Serializers** : `PublicMemberListSerializer` (avec `current_job` calculé depuis l'expérience actuelle), `PublicMemberProfileSerializer`, `MemberProfileSerializer`, `MemberListSerializer`

### App `events` — Événements

**Modèles** : `Event`, `EventParticipant`, `EventSpeaker`

**Endpoints** (`/api/v1/events/`) :

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Public | Liste (filtrée, paginée, `is_published` optionnel) |
| GET | `/<id>/` | Public | Détail avec speakers, QR code |
| POST | `/` | Bureau+ | Créer un événement |
| PATCH | `/<id>/` | Bureau+ | Modifier (titre, dates, statut publication) |
| DELETE | `/<id>/` | Bureau+ | Supprimer |
| POST | `/<id>/register/` | Authentifié | S'inscrire (avec motivation) |
| GET | `/<id>/participants/` | Bureau+ | Liste participants (avec `user_id`) |
| POST | `/<id>/validate/<user_id>/` | Bureau+ | Valider présence |
| GET | `/<id>/export/` | Bureau+ | Export Excel des participants |

### App `memberships` — Adhésions

**Modèles** : `MembershipApplication`, `MembershipComment`

**Statuts** : `pending` → `review` → `approved` / `rejected`

**Endpoints** (`/api/v1/memberships/applications/`) :

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/` | Authentifié | Liste (admin voit tout, candidat voit le sien) |
| GET | `/<id>/` | Authentifié | Détail dossier |
| POST | `/submit/` | Authentifié | Soumettre une demande |
| POST | `/<id>/review/` | Bureau+ | Approuver ou refuser |
| POST | `/<id>/add_comment/` | Authentifié | Ajouter commentaire interne |

### Données de seed

| Email | Rôle | N° membre |
|-------|------|-----------|
| `admin@dah.com` | Administrateur | — |
| `president@dah.com` | Président | DAH-2021-001 |
| `sg@dah.com` | Secrétaire Général | — |
| `tresorier@dah.com` | Trésorier | — |
| `alice@dah.com` | Membre | DAH-2023-001 |
| `bob@dah.com` | Membre | DAH-2023-002 |
| `claire@dah.com` | Formateur | DAH-2022-001 |
| `david@dah.com` | Mentor | DAH-2022-002 |
| `felix@dah.com` | Candidat | — |
| `emma@dah.com` | Candidat | — |

> Mot de passe universel : `Dah@2024!`

---

## Frontend (Next.js 15)

### Infrastructure

- **Auth** : Access token en mémoire JS + cookie (`access_token`, 1h) · Refresh token cookie httpOnly (`refresh_token`, 30j)
- **Axios** : Intercepteur 401 → refresh auto, exclusion des routes auth (`/login`, `/register`, `/token/refresh`)
- **Route protection** : `proxy.ts` (middleware Next.js) — vérifie le cookie `access_token` côté serveur
- **Data fetching** : TanStack Query v5 — `staleTime: 5min` pour les données utilisateur
- **Formulaires** : React Hook Form + Zod (login, register, forgot-password, reset-password)
- **UI** : Tailwind CSS + shadcn/ui — palette `#04041A` navy · `#0972E1` bleu · `#FF8A00` orange
- **Police** : Poppins (Google Fonts via `next/font/google`)

### Routes publiques `(public)/`

| Page | Route | Données |
|------|-------|---------|
| Landing page | `/` | Events + membres preview |
| À propos | `/about` | Statique |
| Événements | `/events` | `GET /events/?is_published=true` |
| Détail événement | `/events/[id]` | `GET /events/[id]/` + inscription |
| Liste membres | `/members` | `GET /members/public/` + recherche client |
| Portfolio membre | `/members/[slug]` | `GET /members/public/[slug]/` |
| Portfolio (alias) | `/portfolio/[slug]` | Identique |

### Routes authentification `(auth)/`

| Page | Route | API |
|------|-------|-----|
| Connexion | `/login` | `POST /auth/login/` |
| Inscription | `/register` | `POST /auth/register/` |
| Mot de passe oublié | `/forgot-password` | `POST /auth/password/reset/` |
| Réinitialisation | `/reset-password/[token]` | `POST /auth/password/reset/confirm/` |
| Vérification email | `/verify-email/[token]` | `POST /auth/email/verify/` |

> Les pages auth redirigent vers `/dashboard` si l'utilisateur est déjà connecté.

### Routes dashboard `(dashboard)/` — protégées

| Page | Route | Accès | Description |
|------|-------|-------|-------------|
| Tableau de bord | `/dashboard` | Tous | Stats + événements à venir + adhésions récentes |
| Mon profil | `/profile` | Tous | Bio, compétences, liens, expériences, certifications, changement mot de passe |
| Ma carte | `/member-card` | Tous | Carte membre numérique recto/verso, impression, partage |
| Adhésions | `/memberships` | Tous | Vue candidat (ma demande) ou admin (toutes les demandes) |
| Dossier adhésion | `/memberships/[id]` | Tous | Détail complet : lettre, décision, commentaires internes |
| Gestion événements | `/manage/events` | Tous | CRUD + publication + lien participants + export Excel |
| Participants | `/manage/events/[id]/participants` | Bureau+ | Liste inscrits, validation présence, export Excel |
| Gestion membres | `/manage/members` | Bureau+ | Liste filtrée et recherche |

### Composants principaux

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `PublicHeader` | `components/PublicHeader.tsx` | Nav avec Accueil, Qui sommes-nous, Événements, **Membres** |
| `PublicFooter` | `components/PublicFooter.tsx` | Footer avec liens, contact, newsletter |
| `Sidebar` | `components/Sidebar.tsx` | Nav dashboard collapsible avec filtrage par rôle |
| `DashboardHeader` | `components/DashboardHeader.tsx` | Header dashboard avec user info + logout |
| `Badge` | `components/ui/Badge.tsx` | Badge coloré (green, red, blue, orange, gray) |

### Services API (`services/`)

| Fichier | Endpoints couverts |
|---------|-------------------|
| `auth.service.ts` | login, register, logout, me, updateMe, changePassword, requestPasswordReset, confirmPasswordReset, verifyEmail |
| `members.service.ts` | list, publicList, publicProfile, myProfile, updateProfile, experiences CRUD, certifications CRUD, socialLinks CRUD |
| `events.service.ts` | list, get, create, update, delete, register, participants, validatePresence, export |
| `memberships.service.ts` | list, get, submit, review, addComment |

### Types TypeScript (`types/`)

- `auth.types.ts` — `User`, `LoginPayload`, `LoginResponse`, `RegisterPayload`, helpers `isAdmin()`, `isBureau()`
- `members.types.ts` — `MemberProfile`, `MemberListItem`, `PublicMemberListItem`, `PublicProfile`, `MemberExperience`, `MemberCertification`, `SocialLink`
- `events.types.ts` — `Event`, `EventDetail`, `EventWritePayload`, `EventParticipant` (avec `user_id`)
- `memberships.types.ts` — `MembershipApplication`, `MembershipComment`, `MembershipStatus`

### Hooks (`hooks/`)

- `useAuth.ts` — `useLogin`, `useLogout`, `useCurrentUser`, `useRegister`

---

## Structure des dossiers

```
DAH_P/
├── backend/                    # Django — nouvelle version
│   ├── config/                 # settings/, urls.py, wsgi.py
│   ├── apps/
│   │   ├── accounts/           # Auth, User custom, JWT, RBAC
│   │   ├── members/            # Profils, expériences, certifications
│   │   ├── events/             # Événements, participants, QR code, export
│   │   ├── memberships/        # Workflow adhésion, commentaires
│   │   └── common/             # Permissions RBAC, mixins
│   └── requirements/
│       ├── base.txt            # Django, DRF, JWT, Celery, psycopg2...
│       ├── dev.txt
│       └── prod.txt
│
├── frontend/                   # Next.js 15 — nouvelle version
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/       # Landing, events, members, about
│   │   │   ├── (auth)/         # login, register, forgot-password, reset-password, verify-email
│   │   │   └── (dashboard)/    # dashboard, profile, member-card, memberships, manage/
│   │   ├── components/         # PublicHeader, PublicFooter, Sidebar, DashboardHeader, Badge
│   │   ├── features/auth/      # LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm + schemas Zod
│   │   ├── services/           # auth, members, events, memberships
│   │   ├── hooks/              # useAuth
│   │   ├── types/              # auth, members, events, memberships
│   │   ├── lib/
│   │   │   ├── axios.ts        # Instance + intercepteurs JWT + gestion cookies
│   │   │   └── utils.ts        # formatDate, avatarUrl, roleLabel, eventTypeLabel...
│   │   └── proxy.ts            # Middleware Next.js — protection des routes
│   └── tailwind.config.ts      # Palette DAH : brand-navy, brand-blue, brand-orange
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── CLAUDE.md                   # Instructions pour Claude Code
└── RECAP.md                    # Ce fichier
```

---

## Flows utilisateur fonctionnels

- **Inscription** → email de vérification → `/verify-email/[token]`
- **Connexion** → cookie access token → dashboard → refresh auto en arrière-plan
- **Reset mot de passe** → email → `/reset-password/[token]` → nouveau mot de passe
- **Profil** → bio, compétences, liens, expériences, certifications, changement mot de passe
- **Candidature adhésion** → lettre de motivation → examen bureau → approbation/refus
- **Événements** → listing public → inscription → validation présence → export Excel
- **Carte membre** → affichage recto/verso → impression PDF → partage lien
- **Portfolio public** → `/members/[slug]` accessible sans compte

---

## Ce qui reste (hors scope MVP)

- Paiements / cotisations (`apps/payments/` — backend non développé)
- Génération certificats PDF (`apps/certificates/`)
- Départements, GED documents, Blog, Projets communautaires
- Notifications (email/WhatsApp) via Celery
- Upload avatar utilisateur (endpoint prévu, UI manquante)
- QR Code scan pour validation présence en temps réel
- Tests automatisés backend (pytest-django)
