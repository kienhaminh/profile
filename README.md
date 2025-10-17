# Portfolio Monorepo

A modern, full-stack developer portfolio website with blog functionality, built as a monorepo using Next.js 15, tRPC, Drizzle ORM, and PostgreSQL.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **API Layer**: tRPC 10 (type-safe procedures with React Query client)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode enabled
- **Testing**: Vitest with UI support
- **Build System**: Turbo (monorepo orchestration)
- **Package Manager**: pnpm

## 📋 Features

- **Blog Management**: Create, edit, publish, and delete blog posts with rich content support
- **Topics & Hashtags**: Categorize posts with topics and hashtags for better organization
- **Projects Showcase**: Display projects with technologies, images, and links
- **Admin Dashboard**: Secure admin area for content management with KPIs and analytics
- **Authentication**: JWT-based admin authentication with bcrypt password hashing
- **Analytics Integration**: Google Analytics 4 for tracking metrics
- **SEO Optimized**: Meta tags, structured data, and performance optimizations
- **Type Safety**: Full TypeScript coverage with runtime validation via Zod
- **Database**: Connection pooling, migrations, and comprehensive schema management

## 🏗️ Project Structure

```
portfolio-monorepo/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/         # Next.js App Router (pages & API routes)
│       │   ├── components/  # React components (ui/ and feature-specific)
│       │   ├── db/          # Database layer (schema, client)
│       │   ├── services/    # Business logic layer
│       │   ├── types/       # Shared TypeScript types and Zod schemas
│       │   └── lib/         # Utilities (auth, validation, etc.)
│       ├── tests/           # Test suites (unit, integration, contract)
│       └── scripts/         # Database and utility scripts
├── package.json             # Root package configuration
├── pnpm-workspace.yaml      # Monorepo workspace configuration
└── turbo.json              # Build pipeline configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Supabase account** (for database hosting)
- **pnpm** (package manager)

### 1. Clone and Install

```bash
git clone <repository-url>
cd profile
pnpm install
```

### 2. Database Setup

#### Supabase Configuration

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Get your database connection string from **Project Settings → Database → Connection String**
3. The connection string format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`

#### Environment Variables

Create a `.env.local` file in the `apps/web` directory:

```env
# Supabase Database Connection
# Get this from Supabase Project Settings → Database → Connection String
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres

# Admin Credentials (for seeding)
# WARNING: Use strong passwords and secure secret management in production
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=Change_This_Strong_Password_123!

# Google Analytics 4 (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads (optional)
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID=XXXXXXXXXX

# Admin Authentication
# Generate with: openssl rand -base64 32
ADMIN_JWT_SECRET=your-secure-random-secret-here
```

**Environment Files**:

- `.env.local` - Development (default)
- `.env.production` - Production environment
- `.env.staging` - Staging environment

### 3. Database Initialization

```bash
# Generate and run migrations
pnpm db:generate
pnpm db:migrate

# Or use the convenient setup command (recommended)
pnpm db:setup
```

The setup command will:

- Create all required database tables
- Set up indexes for optimal performance
- Seed an initial admin user (using credentials from `.env.local`)
- Create sample topics for categorization

### 4. Development Server

```bash
# Start development server (all workspaces)
pnpm dev

# Or start only the web app
pnpm -F @portfolio/web dev
```

The development server will be available at [http://localhost:3000](http://localhost:3000).

### 5. Admin Access

After database setup, you can access the admin dashboard at `/admin` using the credentials from your `.env.local` file.

## 🧪 Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run

# Run only web app tests
pnpm -F @portfolio/web test:run
```

## 🏗️ Build & Deployment

### Build for Production

```bash
# Build all workspaces
pnpm build

# Build only web app
pnpm -F @portfolio/web build
```

### Start Production Server

```bash
# Start production server
pnpm start

# Or for web app only
pnpm -F @portfolio/web start
```

## 🗄️ Database Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Seed admin user (legacy - use db:admin-setup instead)
pnpm db:seed

# Migrate existing plaintext passwords to bcrypt (legacy - use db:admin-setup instead)
pnpm db:migrate-passwords

# Comprehensive admin setup (migration + seeding in one command - RECOMMENDED)
pnpm db:admin-setup

# Full database setup (migrations + comprehensive admin setup)
pnpm db:setup
```

## 🔧 Development Scripts

### Available Commands (Root Level)

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all workspaces for production
- `pnpm lint` - Run linting across all workspaces
- `pnpm test` - Run test suites across all workspaces
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:setup` - Complete database setup

### Available Commands (Web App Level)

```bash
cd apps/web

# Development
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm start           # Start production server

# Testing
pnpm test            # Run tests in watch mode
pnpm test:ui         # Run tests with UI
pnpm test:run        # Run tests once

# Database
pnpm db:generate     # Generate migrations
pnpm db:migrate      # Run migrations
pnpm db:setup        # Full database setup
```

## 📊 Database Schema

The application uses the following main entities:

- **Posts**: Blog posts with content, metadata, and relationships
- **Topics**: Categories for organizing posts
- **Hashtags**: Tags for additional content classification
- **Projects**: Portfolio projects with technologies and media
- **Technologies**: Technology stack items
- **Author Profiles**: Author information and social links
- **Admin Users**: Administrative user accounts

## 🔐 Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Authentication**: Secure admin authentication
- **Rate Limiting**: API endpoint protection
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM

## 📈 Monitoring & Analytics

- **Google Analytics 4**: User behavior tracking
- **Web Vitals**: Core Web Vitals monitoring
- **Error Tracking**: Structured error logging
- **Performance Monitoring**: Database query optimization

## 🚢 Deployment

### Production Checklist

1. ✅ Set up production Supabase database
2. ✅ Configure production environment variables
3. ✅ Set up Google Analytics (if needed)
4. ✅ Configure Google Ads (if needed)
5. ✅ Set up monitoring and error tracking
6. ✅ Configure CDN for static assets
7. ✅ Set up SSL certificate
8. ✅ Configure domain and DNS

### Environment Variables for Production

Create `.env.production` in `apps/web/`:

```env
DATABASE_URL=postgresql://postgres:[PROD-PASSWORD]@[PROD-HOST]:[PORT]/postgres
ADMIN_JWT_SECRET=[secure-production-secret]
NEXT_PUBLIC_GA_MEASUREMENT_ID=[your-ga-id]
# ... other production variables
```

## 🤝 Contributing

1. Follow the established coding patterns and TypeScript interfaces
2. Write tests for new functionality
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all tests pass before submitting PR

## 📝 API Documentation

### Public Endpoints

- `GET /api/blog/posts` - List published posts (supports topic filtering)
- `GET /api/blog/posts/[slug]` - Get single published post

### Admin Endpoints (Protected)

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/posts` - List all posts (including drafts)
- `POST /api/admin/posts` - Create new post
- `PATCH /api/admin/posts/[slug]` - Update post
- `DELETE /api/admin/posts/[slug]` - Delete post

## 📄 License

MIT

## 🆘 Support

For issues and questions:

1. Check existing documentation
2. Review test files for usage examples
3. Check the admin dashboard for configuration options
4. Review database logs for debugging

---

**Happy coding! 🎉**
