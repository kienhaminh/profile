# Quickstart Guide

## Setup

### 1. Environment Configuration

Create `.env.local` in the `web/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID=XXXXXXXXXX
ADMIN_JWT_SECRET=your-secure-random-secret-here
```

### 2. Start Services

**Option A: Using Docker Compose (Recommended)**

```bash
cd /Users/kien.ha/Code/porfolio
docker-compose up
```

**Option B: Local Development**

```bash
# Start database
docker-compose up db -d

# Navigate to web directory
cd web

# Install dependencies
npm install

# Run migrations and seed
npm run db:setup

# Start dev server
npm run dev
```

### 3. Access the Application

- Home: http://localhost:3000
- Blog: http://localhost:3000/blog
- Projects: http://localhost:3000/projects
- Admin: http://localhost:3000/admin

Default admin credentials (after seeding):

- Username: `admin`
- Password: `admin123`

## Verification Checklist

1. **Home Page**: Verify name, role, summary, nav to Projects/Blog
2. **Projects**: Verify project cards show title, summary, and link to detail
3. **Blog Index**: Verify posts list, topics, and filter by a topic
4. **Blog Post**: Verify headings, code formatting, read time, related topics
5. **Admin Login**: Access CMS/dashboard, create a draft post, publish it; verify it appears on the public blog
6. **Analytics**: Verify GA4 integration in dashboard (link to GA4 console)
7. **Ads**: Verify Ads render on blog page (non-intrusive)
8. **Security**: Verify rate limiting on admin login (5 attempts per 15 minutes)
9. **Error Handling**: Test 404 pages and error boundaries

## Testing

```bash
cd web
npm run test:run    # Run all tests
npm run lint        # Check linter errors
npm run build       # Verify production build
```
