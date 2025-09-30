# Developer Portfolio Website

A modern, full-stack developer portfolio website with blog functionality built with Next.js 15, Drizzle ORM, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode enabled
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database running locally or via Docker
- npm or pnpm

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads (optional)
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID=XXXXXXXXXX

# Admin Auth
ADMIN_JWT_SECRET=your-secure-random-secret-here
```

### Installation

```bash
npm install
```

### Database Setup

1. **Generate migrations** from the Drizzle schema:

```bash
npm run db:generate
```

2. **Run migrations** to create tables:

```bash
npm run db:migrate
```

3. **Seed admin user** (optional):

```bash
npm run db:seed
```

You can customize the admin credentials using environment variables:

```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=yourpassword
```

### Development

#### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services (database + web app)
docker-compose up

# The web app will automatically run migrations and start on http://localhost:3000
```

#### Option 2: Local Development

Start the database:

```bash
docker-compose up db -d
```

Run the development server:

```bash
npm run dev
```

The dev server automatically runs migrations on startup.

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Building for Production

```bash
npm run build
npm start
```

## Database Commands

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:migrate:run` - Apply pending migrations programmatically
- `npm run db:seed` - Seed the admin user
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
