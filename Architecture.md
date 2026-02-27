# Ogla — Architecture Document

> **Version:** 1.0
> **Date:** February 2026
> **Status:** Approved — Pre-Implementation

---

## 1. Executive Summary

Ogla is a martial arts management platform enabling Athletes, Clubs, and a SuperAdmin
to manage profiles, affiliations, and competitions. The system follows a LinkedIn-inspired
model for professional martial arts networking.

**Key architectural decisions:**

- **Modular Monolith** over microservices (solo developer, MVP-first, extract later)
- **Turborepo Monorepo** for shared types across web, API, and future mobile
- **Next.js + NestJS + PostgreSQL** as the core stack
- **Real-time** via WebSockets + Redis Pub/Sub
- **Trilingual** from Phase 6 (English, Arabic with RTL, French)

---

## 2. System Context

```
┌─────────────────────────────────────────────────────────┐
│                        USERS                            │
│   Athletes    │    Clubs    │    SuperAdmin              │
└──────┬────────┴──────┬──────┴──────┬────────────────────┘
       │               │             │
       ▼               ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js (Web App)                     │
│            Vercel — SSR/SSG + Client SPA                │
└───────────────────────┬─────────────────────────────────┘
                        │ GraphQL (HTTPS)
                        │ WebSocket (WSS)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS (API Server)                   │
│              Railway/Render — Container                  │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Auth   │ │ Athletes │ │  Clubs   │ │Competitions│  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Chat   │ │  Notifs  │ │  Media   │ │   Admin   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└────────┬───────────────┬────────────────┬───────────────┘
         │               │                │
         ▼               ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis     │ │  Cloudinary  │
│   (Neon)     │ │  (Upstash)   │ │   (Media)    │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. Architecture Decisions Record (ADR)

### ADR-001: Modular Monolith over Microservices

**Context:** Solo developer building an MVP targeting 10K+ users.

**Decision:** Modular monolith with clean domain boundaries and domain events.

**Rationale:**
- Microservices impose massive operational overhead (service discovery, distributed tracing, saga patterns) unsuitable for a solo developer
- A modular monolith with NestJS modules creates natural extraction boundaries
- PostgreSQL handles 10K+ users easily without horizontal DB sharding
- Domain events (EventEmitter2) between modules can be replaced with message queues (RabbitMQ/Kafka) when extracting

**Consequences:**
- Faster development, simpler deployment
- Must maintain strict module boundaries (no cross-module DB access)
- Future extraction path: Module → NestJS Microservice → Separate repo

---

### ADR-002: Turborepo Monorepo

**Context:** Web app now, mobile app later, shared types needed.

**Decision:** Turborepo monorepo with apps/ and packages/ workspaces.

**Rationale:**
- Shared TypeScript types between frontend (Next.js), backend (NestJS), and future mobile (Expo)
- Single CI/CD pipeline
- Turborepo is simpler than Nx for this scale while providing task caching and dependency graph

**Trade-offs vs Nx:**
- Nx has more generators and plugins
- Turborepo is lighter, less config, sufficient for our needs

---

### ADR-003: Next.js over Angular

**Context:** Project needs mobile code sharing and SSR.

**Decision:** Next.js 14+ with App Router.

**Rationale:**
- React ecosystem enables code sharing with React Native (Expo) for the future mobile app
- Next.js App Router provides SSR/SSG, server components, and route groups natively
- Tailwind CSS + shadcn/ui for rapid UI development
- Apollo Client works seamlessly with Next.js server/client components

---

### ADR-004: GraphQL Code-First

**Context:** API needs to serve web and mobile with different data needs.

**Decision:** NestJS GraphQL code-first approach.

**Rationale:**
- Code-first generates schema from TypeScript decorators — single source of truth
- Clients request exactly the fields they need (no over-fetching)
- Subscriptions for real-time features (live scores, chat)
- Prisma types integrate naturally with GraphQL resolvers

---

### ADR-005: PostgreSQL + Prisma

**Context:** Relational data (athletes, clubs, affiliations, competitions) with complex queries.

**Decision:** PostgreSQL with Prisma ORM.

**Rationale:**
- Relational model fits the domain perfectly (affiliations are many-to-many, competitions have nested matches)
- Prisma provides type-safe queries, auto-generated migrations, and excellent DX
- PostgreSQL JSONB for flexible fields (achievements, metadata)
- Neon provides serverless PostgreSQL with generous free tier

---

### ADR-006: Redis for Cache + Real-time

**Context:** Real-time features (live scores, chat, notifications) + session management.

**Decision:** Redis (Upstash serverless).

**Rationale:**
- Pub/Sub for WebSocket event distribution (scales across server instances)
- Session/token caching for fast auth checks
- Rate limiting for API protection
- Upstash is serverless, pay-per-request, zero maintenance

---

### ADR-007: Cloudinary over AWS S3

**Context:** Media storage for avatars, club logos, competition photos.

**Decision:** Cloudinary.

**Rationale:**
- Built-in image transformations (resize, crop, format conversion) without custom code
- CDN included
- Simpler SDK than S3 + CloudFront + Lambda@Edge
- Free tier: 25K transformations/month, 25GB storage

---

### ADR-008: Docker Compose for Local Infrastructure

**Context:** Local development needs PostgreSQL and Redis without polluting the host machine.

**Decision:** All local infrastructure services run as Docker containers via `docker-compose.yml` at the monorepo root.

**Rationale:**
- Zero host-level installations required (no local `pg`, no local `redis-server`)
- `docker compose up -d` gives every developer an identical local environment instantly
- Environment parity: same images (`postgres:16-alpine`, `redis:7-alpine`) used in CI
- Easy teardown / reset (`docker compose down -v` wipes volumes cleanly)
- Mirrors production service versions exactly

**Local service map:**

| Service    | Image              | Port  | Env var default                                      |
| ---------- | ------------------ | ----- | ---------------------------------------------------- |
| PostgreSQL | postgres:16-alpine | 5432  | `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ogla` |
| Redis      | redis:7-alpine     | 6379  | `REDIS_URL=redis://localhost:6379`                   |

**Consequences:**
- Docker Desktop (or OrbStack on macOS) must be running before `npm run dev`
- CI uses `services:` blocks in GitHub Actions — same images, no Docker Compose needed in CI

---

### ADR-009: Bruno (VS Code) for API Testing

**Context:** Need a lightweight tool to manually test and document all GraphQL operations during development.

**Decision:** Bruno VS Code extension. Collections committed to `apps/api/bruno/`.

**Rationale:**
- Bruno stores collections as plain files (committed to Git) — no external accounts or cloud sync
- VS Code extension integrates directly into the development workflow
- Supports GraphQL queries, mutations, and subscriptions natively
- Environments (`local`, `staging`) stored as env files alongside collections
- No Postman/Insomnia: eliminates JSON export/import friction and secret leaks via shared workspaces

**Collection structure:**
```
apps/api/bruno/
├── environments/
│   ├── local.bru
│   └── staging.bru
├── auth/
│   ├── register.bru
│   ├── login.bru
│   └── refresh-tokens.bru
├── users/
│   ├── me.bru
│   └── update-profile.bru
├── athletes/
├── clubs/
├── affiliations/
├── competitions/
├── chat/
└── notifications/
```

**Convention:** Every new resolver or mutation must have a corresponding Bruno request committed in the same PR.

---

## 4. Domain Model

### 4.1 Entity Relationship Diagram

```
User (1) ──── (0..1) AthleteProfile
User (1) ──── (0..1) ClubProfile

AthleteProfile (1) ──── (*) Affiliation (*) ──── (1) ClubProfile
AthleteProfile (1) ──── (*) CompetitionEntry (*) ──── (1) Competition

Competition (1) ──── (*) Match
Match (*) ──── (2) AthleteProfile

User (1) ──── (*) Message
User (*) ──── (*) ChatRoom
User (1) ──── (*) Notification
```

### 4.2 Core Entities Detail

#### User
| Field        | Type     | Notes                           |
| ------------ | -------- | ------------------------------- |
| id           | UUID     | Primary key                     |
| email        | String   | Unique, indexed                 |
| passwordHash | String?  | Null for OAuth-only users       |
| role         | Enum     | ATHLETE, CLUB, SUPER_ADMIN      |
| firstName    | String   |                                 |
| lastName     | String   |                                 |
| avatar       | String?  | Cloudinary URL                  |
| locale       | Enum     | EN, AR, FR                      |
| provider     | Enum     | LOCAL, GOOGLE, FACEBOOK         |
| providerId   | String?  | OAuth provider user ID          |
| createdAt    | DateTime |                                 |
| updatedAt    | DateTime |                                 |

#### AthleteProfile
| Field         | Type     | Notes                          |
| ------------- | -------- | ------------------------------ |
| id            | UUID     |                                |
| userId        | UUID     | FK → User                      |
| beltRank      | String?  |                                |
| weightClass   | String?  |                                |
| bio           | Text?    |                                |
| disciplines   | String[] | e.g., ["Karate", "Judo"]       |
| achievements  | JSONB?   | Flexible structured data       |
| dateOfBirth   | Date?    |                                |

#### ClubProfile
| Field        | Type     | Notes                           |
| ------------ | -------- | ------------------------------- |
| id           | UUID     |                                 |
| userId       | UUID     | FK → User                       |
| name         | String   |                                 |
| description  | Text?    |                                 |
| address      | String?  |                                 |
| logo         | String?  | Cloudinary URL                  |
| disciplines  | String[] |                                 |
| foundedYear  | Int?     |                                 |
| website      | String?  |                                 |

#### Affiliation
| Field      | Type      | Notes                             |
| ---------- | --------- | --------------------------------- |
| id         | UUID      |                                   |
| athleteId  | UUID      | FK → AthleteProfile               |
| clubId     | UUID      | FK → ClubProfile                  |
| status     | Enum      | PENDING, ACTIVE, REJECTED, LEFT   |
| role       | String?   | e.g., "Coach", "Member"           |
| startDate  | DateTime  |                                   |
| endDate    | DateTime? |                                   |

#### Competition
| Field       | Type     | Notes                            |
| ----------- | -------- | -------------------------------- |
| id          | UUID     |                                  |
| name        | String   |                                  |
| description | Text?    |                                  |
| discipline  | String   |                                  |
| location    | String   |                                  |
| startDate   | DateTime |                                  |
| endDate     | DateTime |                                  |
| status      | Enum     | DRAFT, OPEN, IN_PROGRESS, CLOSED |
| createdBy   | UUID     | FK → User (SuperAdmin)           |

#### CompetitionEntry
| Field         | Type   | Notes                             |
| ------------- | ------ | --------------------------------- |
| id            | UUID   |                                   |
| athleteId     | UUID   | FK → AthleteProfile               |
| competitionId | UUID   | FK → Competition                  |
| weightClass   | String |                                   |
| status        | Enum   | REGISTERED, CONFIRMED, WITHDRAWN  |

#### Match
| Field         | Type     | Notes                          |
| ------------- | -------- | ------------------------------ |
| id            | UUID     |                                |
| competitionId | UUID     | FK → Competition               |
| athlete1Id    | UUID     | FK → AthleteProfile            |
| athlete2Id    | UUID     | FK → AthleteProfile            |
| winnerId      | UUID?    | FK → AthleteProfile            |
| round         | Int      |                                |
| score         | JSONB?   | Flexible scoring format        |
| status        | Enum     | SCHEDULED, LIVE, COMPLETED     |
| scheduledAt   | DateTime |                                |

#### ChatRoom
| Field        | Type     | Notes              |
| ------------ | -------- | ------------------ |
| id           | UUID     |                    |
| type         | Enum     | DM, GROUP          |
| name         | String?  | For group chats    |
| participants | UUID[]   | FK → User          |
| createdAt    | DateTime |                    |

#### Message
| Field     | Type     | Notes          |
| --------- | -------- | -------------- |
| id        | UUID     |                |
| roomId    | UUID     | FK → ChatRoom  |
| senderId  | UUID     | FK → User      |
| content   | Text     |                |
| createdAt | DateTime |                |

#### Notification
| Field     | Type     | Notes                                  |
| --------- | -------- | -------------------------------------- |
| id        | UUID     |                                        |
| userId    | UUID     | FK → User                              |
| type      | Enum     | AFFILIATION, COMPETITION, CHAT, SYSTEM |
| title     | String   |                                        |
| payload   | JSONB    | Context data                           |
| read      | Boolean  | Default false                          |
| createdAt | DateTime |                                        |

---

## 5. API Design (GraphQL)

### 5.1 Key Operations

```graphql
# Auth
mutation login(email, password) → AuthPayload
mutation register(input) → AuthPayload
mutation socialLogin(provider, token) → AuthPayload

# Profiles
query me → User
query athlete(id) → AthleteProfile
query club(id) → ClubProfile
query searchAthletes(filters) → [AthleteProfile]
query searchClubs(filters) → [ClubProfile]

# Affiliations
mutation requestAffiliation(clubId) → Affiliation
mutation respondToAffiliation(id, accept) → Affiliation
query myAffiliations → [Affiliation]

# Competitions (SuperAdmin)
mutation createCompetition(input) → Competition
mutation updateCompetition(id, input) → Competition
query competitions(filters) → [Competition]
query competition(id) → Competition

# Matches
mutation updateMatchScore(id, score) → Match
subscription matchUpdated(competitionId) → Match

# Chat
mutation sendMessage(roomId, content) → Message
subscription messageReceived(roomId) → Message

# Notifications
query notifications → [Notification]
subscription notificationReceived → Notification
```

### 5.2 Auth Flow

```
1. User registers (email/password) or clicks "Login with Google"
2. Backend validates → issues JWT (access: 15min, refresh: 7d)
3. Tokens stored in httpOnly secure cookies
4. Apollo Link attaches access token to every GraphQL request
5. On 401 → Apollo Link silently refreshes using refresh token
6. Role-based guards on resolvers (@Roles(SUPER_ADMIN))
```

---

## 6. Real-time Architecture

```
┌──────────────┐         ┌──────────────┐
│  Browser A   │◄──WSS──►│              │
├──────────────┤         │   NestJS     │
│  Browser B   │◄──WSS──►│  WebSocket   │◄──►  Redis Pub/Sub
├──────────────┤         │  Gateway     │
│  Mobile App  │◄──WSS──►│              │
└──────────────┘         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  PostgreSQL  │
                         │  (persist)   │
                         └──────────────┘
```

**Channels:**

| Channel               | Events                                         |
| --------------------- | ---------------------------------------------- |
| live-scores           | matchStarted, scoreUpdated, matchEnded         |
| chat:{roomId}         | newMessage, typing, read                       |
| notifications:{uid}   | newNotification, notificationRead              |

**Scaling:** Redis Pub/Sub ensures events propagate across multiple NestJS instances.

---

## 7. Security

| Concern           | Solution                                           |
| ----------------- | -------------------------------------------------- |
| Authentication    | JWT (httpOnly cookies) + OAuth2                    |
| Authorization     | RBAC guards on GraphQL resolvers                   |
| Input validation  | class-validator + class-transformer (NestJS pipes) |
| Rate limiting     | Redis-based throttling (nestjs/throttler)          |
| CORS              | Whitelist frontend domain only                     |
| SQL injection     | Prisma parameterized queries (built-in)            |
| XSS               | React auto-escaping + CSP headers                  |
| File upload       | Cloudinary direct upload (signed URLs)             |
| Secrets           | Environment variables (.env), never committed      |

---

## 8. Internationalization (i18n)

| Aspect          | Implementation                                     |
| --------------- | -------------------------------------------------- |
| Routing         | app/[locale]/ — /en/athletes, /ar/athletes         |
| Translation     | JSON files: en.json, ar.json, fr.json              |
| RTL             | Tailwind dir="rtl" + rtl: variant classes          |
| Date/Number     | Intl API with locale-aware formatting              |
| Backend errors  | nestjs-i18n translates validation/error messages   |
| Detection       | Accept-Language header → cookie → default (EN)     |

---

## 9. Testing Strategy

| Layer          | Tool                    | Target                              |
| -------------- | ----------------------- | ----------------------------------- |
| Unit (API)     | Jest                    | Services, utils                     |
| Integration    | Jest + Supertest        | Resolvers, auth flow                |
| Unit (Web)     | Jest + RTL              | Components, hooks                   |
| E2E            | Playwright (future)     | Critical user flows                 |
| DB             | Prisma test utils       | Migrations, seeds                   |
| API (manual)   | Bruno (VS Code)         | GraphQL queries, mutations, subscriptions |

**Bruno workflow:**
- Install the Bruno VS Code extension.
- Open `apps/api/bruno/` as the collection root.
- Select the `local` environment (points to `http://localhost:4000/graphql`).
- Every new resolver requires a committed `.bru` request file in the matching module folder.
- CI does **not** run Bruno — it is a developer-facing tool only. Automated coverage is handled by Jest.

**Local infra for tests:**
Integration tests connect to a real PostgreSQL instance running in Docker. The test database is isolated via a separate `DATABASE_URL` (`ogla_test` schema). CI spins up `postgres:16` and `redis:7` as job services.

---

## 10. Deployment

### Local Development

| Service    | How it runs                     | Port |
| ---------- | ------------------------------- | ---- |
| Web        | `npm run dev` (Next.js)         | 3000 |
| API        | `npm run dev` (NestJS watch)    | 4000 |
| PostgreSQL | Docker container (postgres:16)  | 5432 |
| Redis      | Docker container (redis:7)      | 6379 |

```bash
# Start infrastructure
docker compose up -d

# Start all apps (Turborepo)
npm run dev
```

### MVP (Free Tier — Production)

| Service    | Platform   | Cost        |
| ---------- | ---------- | ----------- |
| Web        | Vercel     | $0          |
| API        | Railway    | $0-5        |
| PostgreSQL | Neon       | $0          |
| Redis      | Upstash    | $0          |
| Media      | Cloudinary | $0          |
| **Total**  |            | **$0-5/mo** |

### Production (Scale)

| Service    | Platform        | Est. Cost    |
| ---------- | --------------- | ------------ |
| Web        | Vercel Pro      | $20/mo       |
| API        | Railway Pro     | $20/mo       |
| PostgreSQL | Neon Pro        | $19/mo       |
| Redis      | Upstash Pro     | $10/mo       |
| Media      | Cloudinary Plus | $89/mo       |
| **Total**  |                 | **~$160/mo** |

---

## 11. MVP Roadmap

### Phase 1 — Foundation (Weeks 1-3)
- Turborepo setup, CI/CD pipeline
- Auth module (register, login, Google OAuth)
- User model + AthleteProfile + ClubProfile
- Basic profile CRUD pages

### Phase 2 — Social Features (Weeks 4-5)
- Affiliation system (request, approve, reject, leave)
- Athlete/Club search & discovery
- Profile pages with public view

### Phase 3 — Competitions (Weeks 6-7)
- SuperAdmin competition CRUD
- Athlete registration flow
- Competition listing & detail pages

### Phase 4 — Real-time (Weeks 8-9)
- WebSocket gateway setup + Redis
- Live match scoring
- Match bracket visualization

### Phase 5 — Communication (Weeks 10-11)
- Chat system (DM + group)
- In-app notifications
- Email notifications (critical events)

### Phase 6 — Polish & Expand (Weeks 12+)
- i18n (Arabic RTL + French)
- Mobile app (React Native / Expo)
- Payment integration (future)

---

## 12. Future Considerations

- **Microservices extraction:** If scaling demands it, extract competitions, chat, or notifications as independent services communicating via message queues
- **CDN:** Move to CloudFront + S3 if media costs grow
- **Search:** Elasticsearch/Meilisearch for advanced athlete/club discovery
- **Analytics:** PostHog or Mixpanel for user behavior tracking
- **Mobile:** React Native (Expo) sharing packages/shared-types and packages/ui
