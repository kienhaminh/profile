# SEO Implementation Guide

## Overview

This project has been optimized for search engine visibility with comprehensive SEO features including metadata optimization, structured data (JSON-LD), Open Graph, Twitter Cards, sitemap generation, and more.

## Features Implemented

### ✅ 1. Metadata Optimization
- **Dynamic page titles** with proper templating
- **Unique meta descriptions** for each page
- **Keyword optimization** per route (including AI research keywords)
- **Canonical URLs** to prevent duplicate content
- **Author and publisher** information
- **Robots meta tags** for indexing control
- **Academic profile integration** (Google Scholar, ResearchGate, ORCID)

### ✅ 2. Structured Data (JSON-LD)
Implemented Schema.org structured data for better search engine understanding:

- **Website Schema**: Site-wide information
- **Person Schema**: Author/developer/researcher information with academic credentials
- **Article Schema**: Blog posts with publishing dates, authors, tags
- **ScholarlyArticle Schema**: Research papers and academic content with citations
- **ResearchProject Schema**: AI/ML research projects with research fields
- **CreativeWork Schema**: Regular projects and portfolio items
- **BreadcrumbList Schema**: Navigation hierarchy
- **FAQ Schema**: AI research topics for voice search optimization

### ✅ 3. Open Graph Protocol
Full Open Graph support for social media sharing:
- Title, description, images
- Type (website/article)
- Locale and site name
- Article-specific metadata (publish date, authors)

### ✅ 4. Twitter Cards
Twitter Card meta tags for enhanced Twitter sharing:
- Large image cards
- Title and description
- Creator and site attribution

### ✅ 5. Sitemap & Robots.txt
- **Dynamic sitemap.xml**: Auto-generates from database content
- **robots.txt**: Proper crawl directives
- All pages indexed with appropriate priority and change frequency

### ✅ 6. Performance Optimization
- Proper viewport configuration
- Theme color meta tags
- Apple touch icons
- PWA manifest support

## AI Research SEO Optimization

This portfolio has been specially optimized for AI researchers and academics:

### 🎓 Academic Credentials
- **University affiliations** in Person schema (Chonnam National University)
- **Research fields** tagged with knowsAbout property
- **Academic social profiles** (Google Scholar, ResearchGate, ORCID)

### 🔬 Research-Specific Schemas
- **ResearchProject Schema**: Automatically applied to projects with AI/ML tags
- **ScholarlyArticle Schema**: Auto-detected for research papers and academic content
- **FAQ Schema**: Answers common questions about research areas

### 🔍 AI Keywords Targeting
Optimized for search terms:
- AI researcher, machine learning, deep learning
- Medical AI, drug discovery, Alzheimer research
- Brain age prediction, AI in healthcare
- Computer vision, NLP, neural networks
- PyTorch, TensorFlow, LangChain

### 🎯 Smart Content Detection
The system automatically detects research content based on:
- Project tags (ai, ml, research, medical, etc.)
- Blog post titles and excerpts
- Research-related keywords

When detected, it uses appropriate academic schemas (ResearchProject, ScholarlyArticle) instead of generic ones.

## File Structure

```
src/
├── config/
│   └── seo.ts                    # Central SEO configuration
│                                 # + AI research keywords
│                                 # + ResearchProject schema generator
│                                 # + ScholarlyArticle schema generator
│                                 # + FAQ schema generator
├── components/
│   └── seo/
│       └── JsonLd.tsx            # Structured data components
│                                 # + ResearchProjectSchema
│                                 # + ScholarlyArticleSchema
│                                 # + FAQSchema
├── app/
│   ├── layout.tsx                # Root metadata + schemas
│                                 # + Enhanced Person schema with academic info
│   ├── page.tsx                  # Home page metadata + FAQ schema
│   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── robots.ts                 # Robots.txt generation
│   ├── blog/
│   │   ├── layout.tsx            # Blog listing metadata
│   │   └── [slug]/
│   │       └── layout.tsx        # Article/ScholarlyArticle auto-detection
│   └── projects/
│       ├── page.tsx              # Projects listing metadata
│       └── [id]/
│           └── layout.tsx        # Project/ResearchProject auto-detection
└── constants/
    └── information.ts            # Site information constants
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables (see `.env.example`):

```env
# Required
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Recommended
NEXT_PUBLIC_SITE_TITLE=Your Title
NEXT_PUBLIC_SITE_BIO=Your bio/description
NEXT_PUBLIC_CONTACT_NAME=Your Name
NEXT_PUBLIC_CONTACT_EMAIL=your@email.com

# Social Media
NEXT_PUBLIC_GITHUB=https://github.com/yourusername
NEXT_PUBLIC_LINKEDIN=https://linkedin.com/in/yourusername
NEXT_PUBLIC_FACEBOOK=https://facebook.com/yourusername
NEXT_PUBLIC_TWITTER=@yourusername

# SEO
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

### Academic & Research Profile Configuration

Academic profiles and institutional information are configured in `/src/constants/information.ts`:

```typescript
export const INFORMATION = {
  // ... other fields

  // Academic & Research Profiles
  academicProfiles: {
    googleScholar: 'https://scholar.google.com/citations?user=YOUR_ID',
    researchGate: 'https://www.researchgate.net/profile/Your-Name',
    orcid: 'https://orcid.org/0000-0000-0000-0000',
  },

  // Organization/Institution
  organization: {
    name: 'Your Company Name',
    type: 'company', // 'company' | 'university' | 'research-institution'
  },

  // Academic Credentials
  currentInstitution: {
    name: 'Your University',
    department: 'Your Department',
    degree: "Master's Student", // or 'PhD Candidate', 'Research Associate', etc.
  },

  alumniOf: {
    name: 'Your Alma Mater',
    degree: 'Bachelor of Science in Computer Science',
  },
};
```

### Customization

Edit `/src/config/seo.ts` to customize:

```typescript
export const SEO_CONFIG = {
  siteName: 'Your Site Name',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  defaultTitle: 'Your Default Title',
  defaultDescription: 'Your description...',
  defaultKeywords: ['keyword1', 'keyword2'],
  // ... more configuration
};
```

## Usage Examples

### Adding Metadata to a New Page

```typescript
// app/new-page/page.tsx
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/config/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  url: '/new-page',
});

export default function NewPage() {
  return <div>Content</div>;
}
```

### Adding Structured Data

```typescript
// app/new-page/layout.tsx
import { JsonLd } from '@/components/seo/JsonLd';

export default function NewPageLayout({ children }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Article Title',
    // ... more schema properties
  };

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}
```

### Adding Research Project Schema

```typescript
// app/research/project-page/layout.tsx
import { generateResearchProjectSchema } from '@/config/seo';
import { ResearchProjectSchema } from '@/components/seo/JsonLd';

export default function ResearchProjectLayout({ children }) {
  const projectSchema = generateResearchProjectSchema({
    title: 'AI-Powered Drug Discovery Platform',
    description: 'Machine learning system for predicting drug-protein interactions',
    url: '/research/drug-discovery',
    startDate: '2024-01-01',
    keywords: ['AI', 'drug discovery', 'machine learning', 'healthcare'],
    githubUrl: 'https://github.com/username/drug-discovery',
    researchField: ['Medical AI', 'Drug Discovery', 'Machine Learning'],
  });

  return (
    <>
      <ResearchProjectSchema data={projectSchema} />
      {children}
    </>
  );
}
```

### Adding Scholarly Article Schema

```typescript
// app/blog/research-paper/layout.tsx
import { generateScholarlyArticleSchema } from '@/config/seo';
import { ScholarlyArticleSchema } from '@/components/seo/JsonLd';

export default function ResearchPaperLayout({ children }) {
  const articleSchema = generateScholarlyArticleSchema({
    title: 'Deep Learning for Alzheimer\'s Detection',
    description: 'Novel approach using CNNs for early Alzheimer\'s detection',
    abstract: 'This paper presents a deep learning framework...',
    url: '/blog/alzheimer-detection',
    publishedTime: '2024-01-15',
    author: ['Kien Ha', 'Co-Author Name'],
    keywords: ['deep learning', 'Alzheimer', 'CNN', 'medical imaging'],
    doi: '10.1234/example.doi',
  });

  return (
    <>
      <ScholarlyArticleSchema data={articleSchema} />
      {children}
    </>
  );
}
```

### Adding FAQ Schema for Research Topics

```typescript
// app/page.tsx or any page
import { generateFAQSchema } from '@/config/seo';
import { FAQSchema } from '@/components/seo/JsonLd';

export default function Page() {
  const faqSchema = generateFAQSchema([
    {
      question: 'What AI frameworks do you use?',
      answer: 'PyTorch, TensorFlow, LangChain for AI development...',
    },
    {
      question: 'What are your research interests?',
      answer: 'Medical AI, drug discovery, brain age prediction...',
    },
  ]);

  return (
    <>
      <FAQSchema data={faqSchema} />
      {/* page content */}
    </>
  );
}
```

## SEO Checklist

### ✅ Technical SEO
- [x] Responsive meta viewport
- [x] Canonical URLs
- [x] Robots.txt
- [x] XML Sitemap
- [x] Schema.org structured data
- [x] SSL/HTTPS (configure on deployment)
- [x] Page speed optimization

### ✅ On-Page SEO
- [x] Unique page titles
- [x] Meta descriptions
- [x] Heading hierarchy (H1, H2, H3)
- [x] Alt text for images
- [x] Semantic HTML
- [x] Internal linking

### ✅ Social SEO
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Social sharing images

## Testing Your SEO

### Tools to Use

1. **Google Search Console**
   - Submit your sitemap
   - Monitor indexing status
   - Check mobile usability
   - Track AI research keyword rankings

2. **Google Rich Results Test**
   - Test structured data: https://search.google.com/test/rich-results
   - Validate ResearchProject schema
   - Validate ScholarlyArticle schema
   - Validate FAQ schema

3. **Schema Markup Validator**
   - Test all schemas: https://validator.schema.org/
   - Verify Person schema with academic credentials
   - Check research project metadata

4. **Facebook Sharing Debugger**
   - Test Open Graph: https://developers.facebook.com/tools/debug/

5. **Twitter Card Validator**
   - Test Twitter Cards: https://cards-dev.twitter.com/validator

6. **Lighthouse (Chrome DevTools)**
   - Run SEO audit
   - Check performance metrics

7. **Google Scholar Profile**
   - Verify your profile is linked correctly
   - Check if publications are discoverable

### Local Testing

```bash
# Build the project
pnpm build

# Check sitemap
curl http://localhost:3000/sitemap.xml

# Check robots.txt
curl http://localhost:3000/robots.txt

# Check metadata
View page source in browser
```

## Best Practices

### 1. **Title Tags**
- Keep between 50-60 characters
- Include primary keyword
- Make it unique per page
- Use separators (| or -)

### 2. **Meta Descriptions**
- Keep between 150-160 characters
- Include call-to-action
- Summarize page content
- Include relevant keywords

### 3. **Images**
- Use descriptive filenames
- Add alt text
- Optimize file size
- Use modern formats (WebP)

### 4. **Content**
- Use proper heading hierarchy
- Write for humans, not just search engines
- Keep URLs clean and descriptive
- Update content regularly

### 5. **Performance**
- Minimize page load time
- Optimize images
- Use lazy loading
- Enable compression

## Monitoring

### Key Metrics to Track

1. **Organic Traffic**: Google Analytics
2. **Search Rankings**: Google Search Console
3. **Core Web Vitals**: PageSpeed Insights
4. **Index Coverage**: Google Search Console
5. **Backlinks**: Ahrefs, SEMrush, or Moz

### Regular Tasks

- [ ] Weekly: Check Search Console for errors
- [ ] Monthly: Review and update meta descriptions
- [ ] Monthly: Check and fix broken links
- [ ] Quarterly: Update content for freshness
- [ ] Quarterly: Review and update keywords

## Common Issues & Solutions

### Issue: Pages not being indexed
**Solution**:
1. Check robots.txt isn't blocking
2. Submit sitemap to Google Search Console
3. Ensure pages return 200 status
4. Check for noindex meta tags

### Issue: Duplicate content
**Solution**:
1. Verify canonical URLs are set correctly
2. Use 301 redirects for old URLs
3. Consolidate similar pages

### Issue: Low rankings
**Solution**:
1. Improve content quality and length
2. Add more internal links
3. Get quality backlinks
4. Improve page speed
5. Update meta descriptions for better CTR

## Resources

- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

## Support

For issues or questions about SEO implementation, please:
1. Check this documentation
2. Review the code in `/src/config/seo.ts`
3. Test with the tools mentioned above
4. Consult Next.js documentation

---

**Last Updated**: December 2024
**Version**: 1.0.0
