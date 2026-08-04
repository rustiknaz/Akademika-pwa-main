# replit.md

## Overview

A fullstack dance studio booking application built with React, Express, and PostgreSQL. The app allows users to register/login via phone number authentication through Supabase, view available dance classes, and book sessions. The frontend displays class schedules with instructor information and available spots.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with HMR for development

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Schema Validation**: Zod schemas shared between client and server via drizzle-zod

### Data Storage
- **Primary Database**: PostgreSQL (provisioned via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - contains table definitions using Drizzle's pgTable
- **Migrations**: Managed via `drizzle-kit push` command

### Authentication
- **Provider**: Supabase Auth
- **Method**: Phone-based authentication (converts phone to email format for Supabase compatibility)
- **Client**: Supabase JS client initialized in `client/src/lib/supabase.js`

### Project Structure
```
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components (shadcn/ui)
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utilities (query client, supabase)
│       └── pages/       # Route pages
├── server/              # Express backend
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database operations
│   └── db.ts            # Database connection
├── shared/              # Shared code between client/server
│   ├── schema.ts        # Drizzle database schema
│   └── routes.ts        # API route definitions with Zod
└── migrations/          # Database migrations
```

### Key Design Patterns
- **Type-safe API contracts**: API routes defined with Zod schemas in `shared/routes.ts`, ensuring type safety across client and server
- **Repository pattern**: Database operations abstracted through `IStorage` interface in `server/storage.ts`
- **Component-driven UI**: Extensive use of shadcn/ui primitives for consistent, accessible components

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication & Backend Services
- **Supabase**: Authentication provider and potentially additional backend services
  - URL: `https://xtqlfntveqanhbljxqnl.supabase.co`
  - Used for user authentication and session management

### Key NPM Packages
- **@tanstack/react-query**: Server state management
- **@supabase/supabase-js**: Supabase client SDK
- **drizzle-orm / drizzle-kit**: Database ORM and migrations
- **zod**: Schema validation
- **date-fns**: Date formatting utilities
- **lucide-react**: Icon library