# Developer Portfolio Website

A modern, full-stack developer portfolio website with blog functionality built with Next.js 15, Drizzle ORM, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode enabled
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (for database hosting)
- npm or pnpm

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your DATABASE_URL from Project Settings → Database → Connection String (Direct Connection)
3. The connection string should look like: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`

### Environment Setup

Create a `.env.local` file in the web directory:

```env
# Supabase Database Connection
# Get this from Supabase Project Settings → Database → Connection String (Direct Connection)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres

# Admin Credentials (for seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=yourpassword

# Google Analytics 4 (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads (optional)
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID=XXXXXXXXXX

# Admin Auth
ADMIN_JWT_SECRET=your-secure-random-secret-here
```

**For production**, create `.env.production` with your production Supabase credentials.
**For staging**, create `.env.staging` with your staging Supabase credentials.

### Installation

```bash
npm install
```

### Database Setup

1. **Seed Supabase database** with initial schema and data:

```bash
npm run db:seed:supabase
```

This will:

- Create all required tables (posts, topics, post_topics, author_profiles, admin_users)
- Create indexes
- Seed an admin user (credentials from .env.local)
- Seed sample topics

2. **Optional: Run Drizzle migrations** (if you prefer migration files):

```bash
npm run db:migrate:run
```

### Development

Run the development server:

```bash
npm run dev
```

The dev server automatically runs migrations on startup and will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
npm start
```

## Database Commands

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:migrate:run` - Apply pending migrations programmatically
- `npm run db:seed` - Seed the admin user (legacy)
- `npm run db:seed:supabase` - Seed Supabase with initial schema and data
- `npm run db:setup` - Run migrations and seed (convenient for fresh setup)

## Testing

```bash
npm run test        # Run tests in watch mode
npm run test:ui     # Run tests with UI
npm run test:run    # Run tests once
```

## Project Structure

```
web/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   │   ├── api/          # API endpoints
│   │   ├── admin/        # Admin dashboard
│   │   ├── blog/         # Public blog pages
│   │   └── projects/     # Projects showcase
│   ├── db/               # Database layer
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── index.ts      # Database client
│   ├── services/         # Business logic
│   │   ├── auth.ts       # Authentication service
│   │   ├── posts.ts      # Post management
│   │   └── topics.ts     # Topic management
│   └── lib/              # Utilities
├── scripts/              # Utility scripts
│   └── seed-admin.ts     # Admin user seeding
├── tests/                # Test files
│   ├── contract/         # API contract tests
│   └── integration/      # Integration tests
└── drizzle/              # Generated migrations
```

## Features

- **Blog Management**: Create, edit, publish, and delete blog posts
- **Topics**: Categorize posts by multiple topics
- **Admin Dashboard**: Secure admin area for content management with KPIs
- **Analytics**: Google Analytics 4 integration for tracking metrics
- **Monetization**: Google Ads integration on blog pages (optional)
- **Security**: Rate limiting, security headers, and JWT-based authentication
- **Error Handling**: Structured logging and error boundaries
- **SEO Optimized**: Meta tags and structured data
- **Type-Safe**: Full TypeScript coverage with Drizzle ORM
- **Database**: Connection pooling and automatic migrations

## API Routes

### Public Routes

- `GET /api/blog/posts` - List published posts (supports topic filtering)
- `GET /api/blog/posts/[slug]` - Get single published post

### Admin Routes (require authentication)

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/posts` - List all posts (including drafts)
- `POST /api/admin/posts` - Create new post
- `PATCH /api/admin/posts/[slug]` - Update post
- `DELETE /api/admin/posts/[slug]` - Delete post

## License

MIT
