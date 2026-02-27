# SkillSwap

Plateforme d'echange de competences pair-a-pair avec systeme de credits temps. Proposez vos competences, trouvez des partenaires d'apprentissage et echangez du savoir grace a un systeme de temps equitable.

## Stack technique

- **Backend**: FastAPI + PostgreSQL + Redis + Celery
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Infrastructure**: Docker Compose

## Demarrage rapide

### Prerequis

- Docker & Docker Compose
- Node.js >= 20
- pnpm >= 9

### Backend

```bash
docker compose up -d
```

Services disponibles :
- API: http://localhost:58000
- Adminer (DB): http://localhost:58080

### Frontend

```bash
pnpm install
pnpm dev:web
```

Application web: http://localhost:3200

## Architecture

```
skillswap/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/v1/         # Endpoints REST
│   │   ├── models/         # Modeles SQLAlchemy
│   │   ├── schemas/        # Schemas Pydantic
│   │   ├── services/       # Logique metier
│   │   ├── tasks/          # Taches Celery
│   │   ├── config/         # Configuration
│   │   ├── core/           # Securite, dependances
│   │   └── utils/          # Utilitaires
│   └── tests/              # Tests pytest
├── apps/
│   └── web/                # Application React (Vite)
├── packages/
│   ├── api-client/         # Client Axios + hooks React Query
│   ├── types/              # Types TypeScript partages
│   ├── ui/                 # Composants React reutilisables
│   └── utils/              # Fonctions utilitaires
└── docker-compose.yml
```

## API Endpoints

### Authentication

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/v1/auth/register | Inscription (retourne un token) |
| POST | /api/v1/auth/login | Connexion (retourne un token) |
| GET | /api/v1/auth/me | Profil utilisateur connecte |

### Users

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/users/profile/{user_id} | Profil public d'un utilisateur |
| PUT | /api/v1/users/profile | Modifier son profil |
| GET | /api/v1/users/search?q=term | Rechercher des utilisateurs |

### Skills

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/skills/categories | Liste des categories |
| GET | /api/v1/skills/skills?category_id=X | Liste des competences |
| GET | /api/v1/skills/browse | Explorer les competences avec compteurs |
| POST | /api/v1/skills/offer | Ajouter une competence proposee |
| POST | /api/v1/skills/want | Ajouter une competence recherchee |
| DELETE | /api/v1/skills/offer/{id} | Retirer une competence proposee |
| DELETE | /api/v1/skills/want/{id} | Retirer une competence recherchee |

### Sessions

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/v1/sessions/book | Reserver une session |
| GET | /api/v1/sessions/my-sessions | Mes sessions |
| GET | /api/v1/sessions/upcoming | Sessions a venir |
| PUT | /api/v1/sessions/{id}/confirm | Confirmer une session |
| PUT | /api/v1/sessions/{id}/complete | Completer une session |
| PUT | /api/v1/sessions/{id}/cancel | Annuler une session |

### Reviews

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/v1/reviews/create?session_id=X | Creer un avis |
| GET | /api/v1/reviews/user/{user_id} | Avis recus par un utilisateur |

### Matching

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/matching/matches | Tous les matchs |
| GET | /api/v1/matching/mutual-matches | Matchs mutuels uniquement |

### Dashboard

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/dashboard/my-dashboard | Tableau de bord personnel |
| GET | /api/v1/dashboard/community-stats | Statistiques communautaires |
| GET | /api/v1/dashboard/skill-map | Carte des competences |
| GET | /api/v1/dashboard/top-teachers | Meilleurs enseignants |

### Transactions

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/transactions/balance | Solde de credits temps |
| GET | /api/v1/transactions/history | Historique des transactions |

## Tests

```bash
cd backend
pip install -r requirements.txt
pytest
```
