# Phase 02: Component Design

**Duration**: Week 2-3 (10 days)
**Goal**: Build reusable components with proper types, validation, tests

## Component Specifications

### 1. Tabs Component (`components/ui/tabs.tsx`)

**Purpose**: Reusable tabbed content switcher for About section

**Props**:
```typescript
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}
```

**Usage**:
```tsx
<Tabs defaultValue="skills">
  <TabsList>
    <TabsTrigger value="skills">Main Skills</TabsTrigger>
    <TabsTrigger value="awards">Awards</TabsTrigger>
  </TabsList>
  <TabsContent value="skills">...</TabsContent>
  <TabsContent value="awards">...</TabsContent>
</Tabs>
```

**Styling**:
- Border-bottom list with active indicator
- Smooth underline transition
- Purple accent color
- Keyboard navigable

### 2. Service Card (`components/services/ServiceCard.tsx`)

**Props**:
```typescript
interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}
```

**Features**:
- Icon at top (pink/purple gradient bg)
- Title (text-xl font-bold)
- Description (text-gray-600)
- Hover: lift effect (-translate-y-2)
- Card shadow on hover

**Dimensions**:
- Min height: 280px
- Padding: p-6
- Icon size: 48px circle

### 3. Contact Form (`components/contact/ContactForm.tsx`)

**Schema** (Zod):
```typescript
const contactSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100),
  email: z.string().email('Invalid email'),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;
```

**Fields**:
- Name (text input)
- Email (email input)
- Subject (text input)
- Message (textarea, 6 rows)

**Validation**:
- Real-time field validation
- Error messages below fields
- Disabled submit during submission
- Success/error toast notifications

**States**:
```typescript
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
```

### 4. About Section (`components/sections/AboutSection.tsx`)

**Layout**:
```
┌─────────────────────────────────────┐
│  [Image]    About Me                │
│  400x500    [Tabs: Skills|Awards|   │
│  rounded    Experience|Education]   │
│             [Tab Content Panel]     │
└─────────────────────────────────────┘
```

**Data Props**:
```typescript
interface AboutData {
  intro: string;
  imageUrl: string;
  skills: Skill[];
  awards: Award[];
  experiences: Experience[];
  education: Education[];
}

interface Skill {
  id: number;
  name: string;
  level: number;        // 1-5
  category: string;
}

interface Experience {
  id: number;
  title: string;
  organization: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
}
```

**Responsive**:
- Mobile: Stack image on top, tabs below
- Desktop: Image left (40%), content right (60%)

### 5. Services Section (`components/sections/ServicesSection.tsx`)

**Layout**:
```
┌───────────────────────────────────────┐
│       My Awesome Service              │
│  [Card] [Card] [Card]                 │
│  [Card] [Card] [Card]                 │
└───────────────────────────────────────┘
```

**Grid**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Gap: 8 (32px)

**Data**:
```typescript
interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;        // lucide icon name
  order: number;
}
```

### 6. Contact Section (`components/sections/ContactSection.tsx`)

**Layout**:
```
┌─────────────────────────────────────┐
│  [Contact Form]  [Profile Image]    │
│  Name             600x800           │
│  Email            rounded           │
│  Subject                            │
│  Message                            │
│  [Submit Button]                    │
└─────────────────────────────────────┘
```

**Responsive**:
- Mobile: Stack form on top, image below (or hidden)
- Desktop: Form left (55%), image right (45%)

## Database Schema DDL

### Services Table

```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_active_order ON services(is_active, "order");
```

### Skills Table

```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  level INTEGER CHECK (level >= 1 AND level <= 5),
  start_date DATE,
  end_date DATE,
  organization VARCHAR(255),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON skills(category, is_active, "order");
```

### Contact Submissions Table

```sql
CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_contact_status ON contact_submissions(status, created_at DESC);
```

### Drizzle Schema

```typescript
// db/schema/services.ts
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 100 }).notNull(),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// db/schema/skills.ts
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  level: integer('level'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  organization: varchar('organization', { length: 255 }),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// db/schema/contact.ts
export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at'),
});
```

## API Endpoints (tRPC)

### Services Router

```typescript
// services/services.router.ts
export const servicesRouter = router({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(asc(services.order));
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [service] = await ctx.db
        .select()
        .from(services)
        .where(eq(services.id, input.id));
      return service;
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().min(1),
      icon: z.string().min(1).max(100),
      order: z.number().int().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const [service] = await ctx.db
        .insert(services)
        .values(input)
        .returning();
      return service;
    }),

  // update, delete, reorder methods...
});
```

### Skills Router

```typescript
// services/skills.router.ts
export const skillsRouter = router({
  listByCategory: publicProcedure
    .input(z.object({
      category: z.enum(['main_skill', 'award', 'experience', 'education']),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(skills)
        .where(
          and(
            eq(skills.category, input.category),
            eq(skills.isActive, true)
          )
        )
        .orderBy(asc(skills.order));
    }),

  // CRUD methods...
});
```

### Contact Router

```typescript
// services/contact.router.ts
export const contactRouter = router({
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(255),
      email: z.string().email().max(255),
      subject: z.string().min(5).max(255),
      message: z.string().min(10).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Rate limiting check (TODO: implement)

      const [submission] = await ctx.db
        .insert(contactSubmissions)
        .values({
          ...input,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        })
        .returning();

      // Send email notification (TODO: implement)

      return { success: true, id: submission.id };
    }),

  list: adminProcedure
    .input(z.object({
      status: z.enum(['new', 'read', 'replied']).optional(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const items = await ctx.db
        .select()
        .from(contactSubmissions)
        .where(input.status ? eq(contactSubmissions.status, input.status) : undefined)
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(contactSubmissions)
        .where(input.status ? eq(contactSubmissions.status, input.status) : undefined);

      return {
        items,
        total: count,
        page: input.page,
        pages: Math.ceil(count / input.limit),
      };
    }),

  markAsRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(contactSubmissions)
        .set({ status: 'read', readAt: new Date() })
        .where(eq(contactSubmissions.id, input.id));
      return { success: true };
    }),
});
```

## Seed Data Scripts

```typescript
// scripts/seed-services.ts
const seedServices = [
  {
    title: 'Business Strategy',
    description: 'Strategic planning and business development consulting.',
    icon: 'TrendingUp',
    order: 1,
  },
  {
    title: 'Website Development',
    description: 'Full-stack web development with modern frameworks.',
    icon: 'Monitor',
    order: 2,
  },
  {
    title: 'Marketing & Reporting',
    description: 'Digital marketing campaigns and analytics.',
    icon: 'BarChart',
    order: 3,
  },
  {
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications.',
    icon: 'Smartphone',
    order: 4,
  },
  {
    title: 'UX/UI Design',
    description: 'User-centered design and interface development.',
    icon: 'Palette',
    order: 5,
  },
  {
    title: 'Cloud Solutions',
    description: 'Cloud infrastructure and DevOps services.',
    icon: 'Cloud',
    order: 6,
  },
];

// scripts/seed-skills.ts
const seedSkills = [
  // Main Skills
  { name: 'TypeScript', category: 'main_skill', level: 5, order: 1 },
  { name: 'React & Next.js', category: 'main_skill', level: 5, order: 2 },
  { name: 'Node.js', category: 'main_skill', level: 4, order: 3 },

  // Awards
  { name: 'Best Developer 2024', category: 'award', organization: 'Tech Awards', order: 1 },

  // Experience
  {
    name: 'Senior Developer',
    category: 'experience',
    organization: 'Tech Corp',
    startDate: '2020-01-01',
    endDate: null,
    description: 'Leading development team',
    order: 1,
  },

  // Education
  {
    name: 'Computer Science Degree',
    category: 'education',
    organization: 'University Name',
    startDate: '2015-09-01',
    endDate: '2019-06-01',
    order: 1,
  },
];
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/ServiceCard.test.tsx
describe('ServiceCard', () => {
  it('renders service title and description', () => {});
  it('displays correct icon', () => {});
  it('applies hover effects', () => {});
});

// __tests__/components/ContactForm.test.tsx
describe('ContactForm', () => {
  it('validates required fields', () => {});
  it('shows error messages', () => {});
  it('submits form data', () => {});
  it('displays success message', () => {});
});

// __tests__/components/AboutTabs.test.tsx
describe('AboutTabs', () => {
  it('switches between tabs', () => {});
  it('keyboard navigation works', () => {});
  it('renders correct content per tab', () => {});
});
```

### Integration Tests

```typescript
// __tests__/services/contact.test.ts
describe('Contact Router', () => {
  it('submits contact form', async () => {});
  it('validates input data', async () => {});
  it('rate limits submissions', async () => {});
});

// __tests__/services/services.test.ts
describe('Services Router', () => {
  it('lists active services', async () => {});
  it('orders services correctly', async () => {});
});
```

## Deliverables

- [ ] Tabs component with keyboard nav
- [ ] Service card with hover effects
- [ ] Contact form with validation
- [ ] About section with tabs
- [ ] Services section grid
- [ ] Contact section layout
- [ ] Database migrations
- [ ] tRPC routers
- [ ] Seed scripts
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] Component documentation

## Timeline (10 Days)

**Days 1-2**: Tabs component + tests
**Days 3-4**: Service/contact cards + tests
**Day 5**: Database schema + migrations
**Days 6-7**: tRPC routers + tests
**Day 8**: Section components
**Day 9**: Seed scripts + data
**Day 10**: Testing + documentation

## Unresolved Questions

- Email service integration (Resend vs SendGrid)?
- Rate limiting implementation (Redis vs in-memory)?
- File upload for contact attachments?
- Recaptcha for spam prevention?
