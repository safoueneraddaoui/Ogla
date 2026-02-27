# AI Coding Assistant Context

This document provides context for AI coding assistants (Claude Code, Gemini
CLI, GitHub Copilot, Cursor, etc.) to understand the Ogla project and
assist with development.

## Project Overview

Ogla is a web platform designed to manage martial arts clubs, athletes, and competitions.
Following a LinkedIn-inspired model, it allows Athletes and Clubs to create and manage their
respective profiles and handle their professional affiliations. The SuperAdmin oversees the
entire ecosystem, with the specific power to create and manage competition events (Martial Arts).

## Tech Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Language           | TypeScript (End-to-End)                 |
| Web Frontend       | Next.js 14+ (App Router) + Tailwind CSS |
| UI Components      | shadcn/ui (Tailwind-native)             |
| Mobile (Future)    | React Native (Expo)                     |
| Backend API        | NestJS + GraphQL (Code-First)           |
| ORM                | Prisma                                  |
| Database           | PostgreSQL                              |
| Cache / Pub-Sub    | Redis (Upstash)                         |
| Real-time          | NestJS WebSocket Gateway (Socket.io)    |
| Auth               | Passport.js (JWT + OAuth2)              |
| GraphQL Client     | Apollo Client                           |
| i18n               | next-intl (frontend) + nestjs-i18n (API)|
| Media Storage      | Cloudinary                              |
| Monorepo           | Turborepo                               |
| Testing            | Jest + React Testing Library (web), Jest (API) |

## Architecture

**Pattern:** Modular Monolith (microservices-ready boundaries) inside a Turborepo monorepo.

> For full architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Monorepo Structure

```
ogla/
├── apps/
│   ├── web/                    # Next.js 14+ (App Router)
│   ├── api/                    # NestJS + GraphQL
│   └── mobile/                 # React Native Expo (future)
├── packages/
│   ├── shared-types/           # Domain interfaces, GraphQL types, enums
│   ├── ui/                     # Shared React components
│   ├── eslint-config/          # Shared ESLint rules
│   └── tsconfig/               # Shared TypeScript configs
├── turbo.json
└── package.json
```

### Backend Structure (apps/api)

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/                     # Guards, decorators, filters, pipes
│   ├── guards/roles.guard.ts
│   ├── decorators/current-user.decorator.ts
│   └── filters/graphql-exception.filter.ts
├── modules/
│   ├── auth/                   # Login, register, OAuth, JWT
│   ├── users/                  # User profiles (base entity)
│   ├── athletes/               # Athlete profiles, stats, history
│   ├── clubs/                  # Club profiles, member management
│   ├── affiliations/           # Athlete ↔ Club relationships
│   ├── competitions/           # Events, brackets, results (SuperAdmin)
│   ├── live-scores/            # Real-time competition scoring
│   ├── chat/                   # Messaging (WebSocket)
│   ├── notifications/          # Push + in-app notifications
│   ├── media/                  # File upload to Cloudinary
│   └── admin/                  # SuperAdmin dashboard
├── prisma/prisma.service.ts
└── config/configuration.ts
```

### Frontend Structure (apps/web)

```
apps/web/src/
├── app/
│   └── [locale]/               # i18n routing (en/ar/fr)
│       ├── layout.tsx
│       ├── page.tsx            # Landing page
│       ├── (auth)/             # Login, Register
│       ├── (dashboard)/        # Authenticated area
│       │   ├── athletes/
│       │   ├── clubs/
│       │   ├── competitions/
│       │   ├── chat/
│       │   └── notifications/
│       └── (admin)/            # SuperAdmin only
├── components/
│   ├── ui/                     # Design system (shadcn/ui)
│   └── features/               # Domain components
├── lib/                        # Apollo client, auth helpers, utils
├── graphql/                    # Co-located queries & mutations
├── hooks/                      # Custom React hooks
├── i18n/                       # en.json, ar.json, fr.json
└── middleware.ts               # Locale detection, auth redirect
```

## Roles & Permissions (RBAC)

| Role          | Capabilities                                                     |
| ------------- | ---------------------------------------------------------------- |
| ATHLETE       | Manage own profile, join/leave clubs, register for competitions  |
| CLUB          | Manage club profile, approve/reject affiliations, manage members |
| SUPER_ADMIN   | All above + create/manage competitions, manage all users         |

## Authentication

- **Methods:** Email/password + Social login (Google, Facebook)
- **Implementation:** Passport.js strategies (local, google, facebook)
- **Tokens:** JWT (access + refresh), stored in httpOnly cookies
- **GraphQL:** Token attached via Apollo Link middleware

## Real-time

- WebSocket Gateway (NestJS + Socket.io) backed by Redis Pub/Sub
- Channels: Live Scores, Chat, Notifications
- Frontend: Apollo Subscriptions + Socket.io client

## Internationalization (i18n)

- **Languages:** English, Arabic, French
- **Frontend:** next-intl with `[locale]` dynamic routing
- **Backend:** nestjs-i18n for API error messages
- **RTL:** Full Arabic RTL support via Tailwind CSS `dir` utilities

## Database — Core Entities

| Entity           | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| User             | Base: email, password, role, avatar, locale                  |
| AthleteProfile   | Belt rank, weight class, bio, achievements, disciplines      |
| ClubProfile      | Name, address, description, logo, disciplines offered        |
| Affiliation      | Athlete ↔ Club link (PENDING/ACTIVE/REJECTED/LEFT)           |
| Competition      | Name, date, location, discipline (created by SuperAdmin)     |
| CompetitionEntry | Athlete registration to a competition                        |
| Match            | Two athletes, result, score, round                           |
| ChatRoom         | Participants, type (DM/GROUP)                                |
| Message          | Sender, room, content, timestamp                             |
| Notification     | User, type, payload, read status                             |

## Coding Conventions

1. **Strict TypeScript:** No `any`. Proper interfaces for all GraphQL responses and domain models.
2. **GraphQL Code-First:** Decorators in NestJS generate the schema. Queries co-located with features.
3. **Smart/Dumb Components:** Container components handle data (Apollo hooks), presentational components receive props.
4. **Server Components:** Use Next.js Server Components by default; Client Components only when needed (interactivity, hooks).
5. **Feature Modules:** Each NestJS module is self-contained (resolver, service, DTOs). Domain events for cross-module communication.
6. **Apollo Client:** Centralized client config in `lib/apollo-client.ts`. Queries/mutations in `graphql/` folder.
7. **Tailwind + shadcn/ui:** No CSS modules. Use Tailwind utilities and shadcn/ui primitives.
8. **Testing:** Jest for all. React Testing Library for components. Integration tests for resolvers.

## Deployment (MVP)

| Service    | Platform                  |
| ---------- | ------------------------- |
| Web        | Vercel                    |
| API        | Railway or Render         |
| PostgreSQL | Neon or Supabase (DB)     |
| Redis      | Upstash                   |
| Media      | Cloudinary                |

## MVP Roadmap

| Phase | Features                                                  |
| ----- | --------------------------------------------------------- |
| 1     | Auth (email + Google), User profiles, Athlete/Club CRUD   |
| 2     | Affiliations (join/leave club), Profile search & discovery|
| 3     | Competitions (SuperAdmin CRUD), Athlete registration      |
| 4     | Live scores, Match brackets, Real-time updates            |
| 5     | Chat, Notifications                                       |
| 6     | i18n (AR/FR), RTL support, Mobile app (Expo)              |
