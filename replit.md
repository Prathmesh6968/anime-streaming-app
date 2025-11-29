# AnimeStream Hub - Replit Setup with Neon Database

## Project Status
- **Setup Date**: November 29, 2025
- **Status**: ✅ Running with Neon PostgreSQL Database
- **Frontend**: React 18 + Vite on Port 5000
- **Backend**: Express.js API on Port 3001
- **Database**: Neon (Serverless PostgreSQL)

## Architecture Overview

### Frontend (Port 5000)
- React 18 with TypeScript
- Vite dev server
- Proxies `/api` requests to backend on `localhost:3001`
- Features: Browse anime, admin panel for content management

### Backend (Port 3001)
- Express.js server
- Drizzle ORM for database operations
- Connect to Neon PostgreSQL via `@neondatabase/serverless`
- RESTful API for anime, episodes, profiles management

### Database (Neon)
- Free serverless PostgreSQL
- Schema defined in `shared/schema.ts`
- Tables: anime, episodes, profiles, watchlist, watch_progress, reviews
- Sample data: 6 anime series with 3 episodes each

## Key Features
- Create, read, update, delete anime series from admin panel
- Upload episodes with video URLs (YouTube, Vimeo, direct links)
- Manage user roles (user/admin)
- Fully functional anime streaming interface
- No external dependencies on Supabase

## Development Commands
```bash
npm run dev              # Run frontend + backend concurrently
npm run client          # Run frontend only (port 5000)
npm run server          # Run backend only (port 3001)
npm run db:push         # Push schema changes to Neon database
npm run build           # Build for production
npm run lint            # Run linters and type checking
```

## Database Setup
1. Database URL is stored as `DATABASE_URL` secret
2. Schema is automatically synced with `npm run db:push`
3. Sample data is seeded via `server/seed.ts`
4. Drizzle ORM handles all database operations safely

## File Structure
```
├── src/                   # React frontend
│   ├── pages/            # Page components
│   ├── components/       # React components
│   ├── db/api.ts         # Frontend API calls to backend
│   └── ...
├── server/               # Express backend
│   ├── index.ts          # API routes
│   ├── db.ts             # Database connection
│   └── seed.ts           # Sample data seeding
├── shared/               # Shared code
│   └── schema.ts         # Drizzle ORM schema
├── drizzle/              # Database migrations (auto-generated)
├── vite.config.ts        # Vite configuration with proxy
└── drizzle.config.ts     # Drizzle configuration
```

## Workflow
- **Name**: Start application
- **Command**: `npm run dev`
- **Output**: Webview on port 5000
- **Backend**: Runs on port 3001 (internal only)

## Deployment
- Build command: `npm run build`
- Public directory: `dist`
- Deployment type: Static (frontend) + serverless backend
- Environment variable required: `DATABASE_URL` (Neon connection string)

## Admin Access
1. Go to `/admin` route
2. Default access: User stored in `adminAuth` localStorage
3. Create/edit/delete anime and episodes
4. Manage user roles

## Notes
- Migrated from Supabase to Neon for complete local control
- No authentication currently required for admin panel (protected via localStorage)
- Video player supports embeddable video formats
- All data stored in Neon PostgreSQL (persists across restarts)
