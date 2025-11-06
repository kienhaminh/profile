# Phase 03: Implementation

**Duration**: Week 4 (7 days)
**Goal**: Integrate components, update homepage, deploy to staging

## Implementation Steps

### Step 1: Database Setup (Day 1)

**1.1 Generate Migrations**
```bash
cd apps/web
pnpm db:generate
```

**1.2 Create Migration Files**

File: `db/migrations/XXXX_add_services_skills_contact.sql`

```sql
-- Services table
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

-- Skills table
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

-- Contact submissions table
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

-- Add configs for About section
INSERT INTO configs (key, value) VALUES
  ('ABOUT_INTRO', 'Your about intro text here'),
  ('ABOUT_IMAGE', '/assets/about-profile.jpg'),
  ('HIRE_ME_TAGLINE', 'I am available for freelance work'),
  ('HIRE_ME_DESCRIPTION', 'Let''s discuss your project and bring your ideas to life.');
```

**1.3 Run Migrations**
```bash
pnpm db:migrate
```

**1.4 Run Seed Scripts**
```bash
node scripts/seed-services.js
node scripts/seed-skills.js
```

### Step 2: Component Development (Days 2-4)

**2.1 Tabs Component** (shadcn/ui)

```bash
# Install shadcn tabs if not exists
npx shadcn@latest add tabs
```

File: `components/ui/tabs.tsx` (use shadcn version)

**2.2 Service Card Component**

File: `components/services/ServiceCard.tsx`

```tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function ServiceCard({ title, description, icon: Icon, className }: ServiceCardProps) {
  return (
    <Card className={`service-card h-full border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 ${className}`}>
      <CardHeader>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
```

**2.3 Contact Form Component**

File: `components/contact/ContactForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc/client';

const contactSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100),
  email: z.string().email('Invalid email'),
  subject: z.string().min(5, 'Subject too short').max(200),
  message: z.string().min(10, 'Message too short').max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitState('success');
      reset();
      setTimeout(() => setSubmitState('idle'), 5000);
    },
    onError: () => {
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 5000);
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <Input
          id="name"
          {...register('name')}
          className="contact-input"
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Your Email
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="contact-input"
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <Input
          id="subject"
          {...register('subject')}
          className="contact-input"
          placeholder="Project Inquiry"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Your Message
        </label>
        <textarea
          id="message"
          {...register('message')}
          rows={6}
          className="contact-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Tell me about your project..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {submitState === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Message sent successfully! I'll get back to you soon.
        </div>
      )}

      {submitState === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          Failed to send message. Please try again.
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitMutation.isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        {submitMutation.isPending ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

### Step 3: Section Components (Days 5-6)

**3.1 About Section**

File: `components/sections/AboutSection.tsx`

```tsx
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AboutSectionProps {
  intro: string;
  imageUrl: string;
  skills: Array<{ id: number; name: string; level: number }>;
  experiences: Array<{ id: number; title: string; organization: string; description: string }>;
}

export function AboutSection({ intro, imageUrl, skills, experiences }: AboutSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src={imageUrl}
                alt="About profile"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              About <span className="text-purple-600">Me</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">{intro}</p>

            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="skills">Main Skills</TabsTrigger>
                <TabsTrigger value="awards">Awards</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < skill.level ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="experience" className="mt-6">
                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-purple-600 pl-4">
                      <h4 className="font-bold text-lg">{exp.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{exp.organization}</p>
                      <p className="text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Add Awards and Education tabs similarly */}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**3.2 Services Section**

File: `components/sections/ServicesSection.tsx`

```tsx
import { ServiceCard } from '@/components/services/ServiceCard';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            My Awesome <span className="text-purple-600">Service</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = (Icons as any)[service.icon] as LucideIcon;
            return (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                icon={Icon}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**3.3 Contact Section**

File: `components/sections/ContactSection.tsx`

```tsx
import Image from 'next/image';
import { ContactForm } from '@/components/contact/ContactForm';

interface ContactSectionProps {
  tagline: string;
  description: string;
  imageUrl: string;
}

export function ContactSection({ tagline, description, imageUrl }: ContactSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Form */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Hire <span className="text-purple-600">Me.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-2 font-semibold">{tagline}</p>
            <p className="text-gray-600 mb-8">{description}</p>

            <ContactForm />
          </div>

          {/* Image */}
          <div className="relative hidden lg:block">
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src={imageUrl}
                alt="Contact profile"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Step 4: Homepage Integration (Day 7)

**4.1 Update Homepage**

File: `apps/web/src/app/page.tsx`

```tsx
import { AboutSection } from '@/components/sections/AboutSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { getConfig } from '@/services/config';
import { trpc } from '@/lib/trpc/server';

export default async function Home() {
  // Fetch data
  const [
    { data: featuredProjects },
    { data: recentBlogs },
    services,
    skills,
    aboutIntro,
    aboutImage,
    hireMeTagline,
    hireMeDescription,
  ] = await Promise.all([
    getAllProjects(PROJECT_STATUS.PUBLISHED, { page: 1, limit: 2 }),
    listBlogs(POST_STATUS.PUBLISHED, { page: 1, limit: 3 }),
    trpc.services.list.query(),
    trpc.skills.listByCategory.query({ category: 'main_skill' }),
    getConfig('ABOUT_INTRO'),
    getConfig('ABOUT_IMAGE'),
    getConfig('HIRE_ME_TAGLINE'),
    getConfig('HIRE_ME_DESCRIPTION'),
  ]);

  return (
    <div className="min-h-screen">
      {/* Existing Hero Section */}
      <HeroSection />

      {/* NEW: About Section */}
      <AboutSection
        intro={aboutIntro || ''}
        imageUrl={aboutImage || '/assets/about-profile.jpg'}
        skills={skills}
        experiences={[]} // Add experiences query
      />

      {/* NEW: Services Section */}
      <ServicesSection services={services} />

      {/* Existing Projects Section */}
      <ProjectsSection projects={featuredProjects} />

      {/* Existing Blog Section */}
      <BlogSection blogs={recentBlogs} />

      {/* NEW: Contact Section */}
      <ContactSection
        tagline={hireMeTagline || ''}
        description={hireMeDescription || ''}
        imageUrl="/assets/contact-profile.jpg"
      />
    </div>
  );
}
```

### Step 5: API Router Integration

**5.1 Add Routers to Main Router**

File: `services/index.ts`

```typescript
import { servicesRouter } from './services.router';
import { skillsRouter } from './skills.router';
import { contactRouter } from './contact.router';

export const appRouter = router({
  // ... existing routers
  services: servicesRouter,
  skills: skillsRouter,
  contact: contactRouter,
});
```

## Files to Create/Modify

### New Files

```
apps/web/src/
├── components/
│   ├── services/
│   │   └── ServiceCard.tsx
│   ├── contact/
│   │   └── ContactForm.tsx
│   └── sections/
│       ├── AboutSection.tsx
│       ├── ServicesSection.tsx
│       └── ContactSection.tsx
├── db/
│   └── schema/
│       ├── services.ts
│       ├── skills.ts
│       └── contact.ts
├── services/
│   ├── services.router.ts
│   ├── skills.router.ts
│   └── contact.router.ts
└── scripts/
    ├── seed-services.ts
    └── seed-skills.ts
```

### Modified Files

```
apps/web/src/
├── app/
│   └── page.tsx              # Add new sections
├── services/
│   └── index.ts              # Add new routers
└── app/
    └── globals.css           # Add new styles
```

## Testing Checklist

- [ ] Services CRUD operations work
- [ ] Skills query by category works
- [ ] Contact form submits successfully
- [ ] Contact form validation works
- [ ] About tabs switch correctly
- [ ] Services grid responsive
- [ ] Contact form responsive
- [ ] Images load correctly
- [ ] All sections animate properly
- [ ] Accessibility: keyboard navigation
- [ ] Accessibility: screen reader labels

## Deployment Steps

1. **Staging Deployment**
   ```bash
   git checkout -b feature/trydo-template
   git add .
   git commit -m "feat: integrate Trydo template sections"
   git push origin feature/trydo-template
   ```

2. **Database Migration (Staging)**
   ```bash
   # Run migrations on staging DB
   pnpm db:migrate
   pnpm db:seed
   ```

3. **Smoke Testing**
   - Test all new sections
   - Verify data loads correctly
   - Check responsive behavior
   - Test contact form submission

4. **Production Deployment**
   - Create PR for review
   - Run CI/CD pipeline
   - Deploy to production
   - Run migrations
   - Monitor for errors

## Rollback Plan

If issues occur:

1. Revert deployment
2. Restore database backup
3. Investigate issues
4. Fix in development
5. Re-deploy

## Unresolved Questions

- Final color scheme approval?
- Asset images ready (about, contact profiles)?
- Email notification setup for contact form?
