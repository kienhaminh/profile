# Phase 04: Testing & Quality Assurance

**Duration**: Week 5 (7 days)
**Goal**: Comprehensive testing, optimization, production readiness

## Test Strategy

### Test Pyramid

```
           E2E Tests (10%)
         ┌─────────────┐
        │  User Flows   │
       └───────────────┘
      Integration Tests (30%)
    ┌─────────────────────┐
   │   API + Components   │
  └──────────────────────┘
    Unit Tests (60%)
┌──────────────────────────┐
│ Components + Functions   │
└──────────────────────────┘
```

## Unit Tests

### Component Tests

**ServiceCard Component**
```typescript
// __tests__/components/ServiceCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ServiceCard } from '@/components/services/ServiceCard';
import { TrendingUp } from 'lucide-react';

describe('ServiceCard', () => {
  const mockProps = {
    title: 'Business Strategy',
    description: 'Strategic planning and consulting',
    icon: TrendingUp,
  };

  it('renders service title', () => {
    render(<ServiceCard {...mockProps} />);
    expect(screen.getByText('Business Strategy')).toBeInTheDocument();
  });

  it('renders service description', () => {
    render(<ServiceCard {...mockProps} />);
    expect(screen.getByText('Strategic planning and consulting')).toBeInTheDocument();
  });

  it('renders icon component', () => {
    const { container } = render(<ServiceCard {...mockProps} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies hover styles on mouse enter', () => {
    const { container } = render(<ServiceCard {...mockProps} />);
    const card = container.firstChild;
    expect(card).toHaveClass('service-card');
  });
});
```

**ContactForm Component**
```typescript
// __tests__/components/ContactForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/contact/ContactForm';
import { trpc } from '@/lib/trpc/client';

jest.mock('@/lib/trpc/client');

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields', async () => {
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name too short/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email', async () => {
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/your email/i);
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockMutate = jest.fn();
    (trpc.contact.submit.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ContactForm />);

    await userEvent.type(screen.getByLabelText(/your name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/your email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/your message/i), 'This is a test message');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
      });
    });
  });

  it('displays success message on successful submission', async () => {
    (trpc.contact.submit.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn((_, { onSuccess }) => onSuccess()),
      isPending: false,
    });

    render(<ContactForm />);

    // Fill and submit form...

    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });
});
```

**AboutTabs Component**
```typescript
// __tests__/components/AboutTabs.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

describe('AboutTabs', () => {
  const TestTabs = () => (
    <Tabs defaultValue="skills">
      <TabsList>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="awards">Awards</TabsTrigger>
      </TabsList>
      <TabsContent value="skills">Skills content</TabsContent>
      <TabsContent value="awards">Awards content</TabsContent>
    </Tabs>
  );

  it('renders default tab content', () => {
    render(<TestTabs />);
    expect(screen.getByText('Skills content')).toBeVisible();
    expect(screen.queryByText('Awards content')).not.toBeVisible();
  });

  it('switches tabs on click', () => {
    render(<TestTabs />);

    const awardsTab = screen.getByRole('tab', { name: /awards/i });
    fireEvent.click(awardsTab);

    expect(screen.getByText('Awards content')).toBeVisible();
    expect(screen.queryByText('Skills content')).not.toBeVisible();
  });

  it('supports keyboard navigation', () => {
    render(<TestTabs />);

    const skillsTab = screen.getByRole('tab', { name: /skills/i });
    skillsTab.focus();

    fireEvent.keyDown(skillsTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: /awards/i })).toHaveFocus();
  });
});
```

## Integration Tests

### API Router Tests

**Services Router**
```typescript
// __tests__/services/services.router.test.ts
import { createCallerFactory } from '@/lib/trpc/server';
import { servicesRouter } from '@/services/services.router';
import { db } from '@/db/client';
import { services } from '@/db/schema/services';

const createCaller = createCallerFactory(servicesRouter);

describe('Services Router', () => {
  beforeEach(async () => {
    await db.delete(services);
  });

  describe('list', () => {
    it('returns active services ordered correctly', async () => {
      await db.insert(services).values([
        { title: 'Service B', description: 'Desc B', icon: 'Icon', order: 2, isActive: true },
        { title: 'Service A', description: 'Desc A', icon: 'Icon', order: 1, isActive: true },
        { title: 'Service C', description: 'Desc C', icon: 'Icon', order: 3, isActive: false },
      ]);

      const caller = createCaller({ db, user: null });
      const result = await caller.list();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Service A');
      expect(result[1].title).toBe('Service B');
    });
  });

  describe('create', () => {
    it('creates new service with admin auth', async () => {
      const caller = createCaller({ db, user: { id: 1, role: 'admin' } });

      const service = await caller.create({
        title: 'New Service',
        description: 'Description',
        icon: 'TrendingUp',
        order: 1,
      });

      expect(service.title).toBe('New Service');
      expect(service.id).toBeDefined();
    });

    it('rejects creation without admin auth', async () => {
      const caller = createCaller({ db, user: null });

      await expect(
        caller.create({
          title: 'New Service',
          description: 'Description',
          icon: 'Icon',
          order: 1,
        })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
```

**Contact Router**
```typescript
// __tests__/services/contact.router.test.ts
import { createCallerFactory } from '@/lib/trpc/server';
import { contactRouter } from '@/services/contact.router';
import { db } from '@/db/client';
import { contactSubmissions } from '@/db/schema/contact';

const createCaller = createCallerFactory(contactRouter);

describe('Contact Router', () => {
  beforeEach(async () => {
    await db.delete(contactSubmissions);
  });

  describe('submit', () => {
    it('creates contact submission', async () => {
      const caller = createCaller({ db, user: null, ip: '127.0.0.1', userAgent: 'test' });

      const result = await caller.submit({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();

      const [submission] = await db
        .select()
        .from(contactSubmissions)
        .where(eq(contactSubmissions.id, result.id));

      expect(submission.name).toBe('John Doe');
      expect(submission.status).toBe('new');
    });

    it('validates input data', async () => {
      const caller = createCaller({ db, user: null });

      await expect(
        caller.submit({
          name: 'J',
          email: 'invalid',
          subject: 'short',
          message: 'short',
        })
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('returns submissions for admin', async () => {
      await db.insert(contactSubmissions).values([
        { name: 'John', email: 'john@test.com', subject: 'Test', message: 'Message' },
        { name: 'Jane', email: 'jane@test.com', subject: 'Test', message: 'Message' },
      ]);

      const caller = createCaller({ db, user: { id: 1, role: 'admin' } });
      const result = await caller.list({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('rejects list without admin auth', async () => {
      const caller = createCaller({ db, user: null });

      await expect(caller.list({ page: 1, limit: 10 })).rejects.toThrow('Unauthorized');
    });
  });
});
```

## E2E Tests (Playwright)

**Homepage Flow**
```typescript
// __tests__/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('displays all sections', async ({ page }) => {
    await page.goto('/');

    // Hero section
    await expect(page.locator('text=Hi, I\'m')).toBeVisible();

    // About section
    await expect(page.locator('text=About Me')).toBeVisible();

    // Services section
    await expect(page.locator('text=My Awesome Service')).toBeVisible();

    // Projects section
    await expect(page.locator('text=Featured Projects')).toBeVisible();

    // Blog section
    await expect(page.locator('text=Latest from the Blog')).toBeVisible();

    // Contact section
    await expect(page.locator('text=Hire Me')).toBeVisible();
  });

  test('about tabs switch correctly', async ({ page }) => {
    await page.goto('/');

    // Click Awards tab
    await page.click('text=Awards');
    await expect(page.locator('[role="tabpanel"]')).toContainText('Award');

    // Click Experience tab
    await page.click('text=Experience');
    await expect(page.locator('[role="tabpanel"]')).toContainText('Experience');
  });
});
```

**Contact Form Flow**
```typescript
// __tests__/e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('submits form successfully', async ({ page }) => {
    await page.goto('/');

    // Scroll to contact section
    await page.locator('text=Hire Me').scrollIntoViewIfNeeded();

    // Fill form
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="subject"]', 'Test Subject');
    await page.fill('[name="message"]', 'This is a test message for the contact form');

    // Submit
    await page.click('button:has-text("Send Message")');

    // Verify success message
    await expect(page.locator('text=Message sent successfully')).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=Hire Me').scrollIntoViewIfNeeded();

    // Submit empty form
    await page.click('button:has-text("Send Message")');

    // Verify error messages
    await expect(page.locator('text=Name too short')).toBeVisible();
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });
});
```

## Performance Testing

### Lighthouse CI Configuration

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/projects",
        "http://localhost:3000/blog"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

### Performance Checklist

- [ ] LCP < 2.5s on 3G connection
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI < 3.5s
- [ ] Page weight < 1MB (excluding images)
- [ ] Images lazy loaded
- [ ] Critical CSS inlined
- [ ] Fonts optimized (next/font)
- [ ] Code split by route

## Accessibility Testing

### WCAG 2.1 AA Checklist

**Perceivable**:
- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Text resizable up to 200%
- [ ] No information conveyed by color alone

**Operable**:
- [ ] All functionality keyboard accessible
- [ ] No keyboard traps
- [ ] Skip to main content link
- [ ] Focus indicators visible
- [ ] Sufficient time for interactions

**Understandable**:
- [ ] Clear labels for form inputs
- [ ] Error messages descriptive
- [ ] Navigation consistent across pages
- [ ] Language attribute set

**Robust**:
- [ ] Valid HTML
- [ ] ARIA landmarks used
- [ ] Screen reader tested
- [ ] Works without JavaScript

### Automated Accessibility Tests

```typescript
// __tests__/a11y/homepage.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import HomePage from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Homepage Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Browser Testing Matrix

| Browser | Version | Platform | Priority |
|---------|---------|----------|----------|
| Chrome | Latest | Desktop | P0 |
| Firefox | Latest | Desktop | P0 |
| Safari | Latest | macOS | P0 |
| Edge | Latest | Desktop | P1 |
| Chrome | Latest | Android | P0 |
| Safari | Latest | iOS | P0 |

## Responsive Testing

**Breakpoints**:
- 320px (Small mobile)
- 375px (Mobile)
- 768px (Tablet)
- 1024px (Small desktop)
- 1440px (Desktop)
- 1920px (Large desktop)

**Test Scenarios**:
- [ ] Hero section responsive
- [ ] About section stacks properly
- [ ] Services grid: 1→2→3 columns
- [ ] Contact form stacks on mobile
- [ ] Images scale correctly
- [ ] Navigation collapses on mobile
- [ ] Footer stacks on mobile

## Deployment Checklist

### Pre-Production

- [ ] All tests passing (unit + integration + e2e)
- [ ] Lighthouse scores meet thresholds
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Responsive testing completed
- [ ] Database migrations tested
- [ ] Seed data verified
- [ ] Environment variables configured
- [ ] Error tracking configured
- [ ] Analytics configured

### Production

- [ ] Database backup created
- [ ] Migrations run successfully
- [ ] Smoke tests passed
- [ ] Performance monitoring active
- [ ] Error tracking active
- [ ] Rollback plan documented
- [ ] Team notified

## Monitoring Setup

**Metrics to Track**:
- Page load times
- API response times
- Error rates
- Contact form submissions
- User engagement per section

**Tools**:
- Google Analytics 4
- Sentry (error tracking)
- Vercel Analytics (performance)

## Timeline (7 Days)

**Day 1**: Unit tests (components)
**Day 2**: Integration tests (APIs)
**Day 3**: E2E tests (user flows)
**Day 4**: Performance testing + optimization
**Day 5**: Accessibility testing + fixes
**Day 6**: Cross-browser + responsive testing
**Day 7**: Final QA + deployment prep

## Success Criteria

- [ ] 80%+ test coverage
- [ ] All critical paths tested
- [ ] Performance targets met
- [ ] Accessibility score 95+
- [ ] Zero critical bugs
- [ ] Documentation complete
- [ ] Deployment successful

## Unresolved Questions

- Production monitoring strategy?
- Error alerting thresholds?
- A/B testing for new sections?
