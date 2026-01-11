import { INFORMATION } from '@/constants/information';

export const SEO_CONFIG = {
  // Base configuration
  siteName: INFORMATION.name,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  defaultTitle: `${INFORMATION.name} - ${INFORMATION.title}`,
  titleTemplate: `%s | ${INFORMATION.name}`,
  defaultDescription:
    INFORMATION.bio ||
    'Full-stack developer specializing in modern web technologies, React, Next.js, and TypeScript. Building scalable applications with excellent user experience.',
  defaultKeywords: [
    // AI Research & Academia
    'AI researcher',
    'artificial intelligence research',
    'machine learning researcher',
    'deep learning',
    'medical AI',
    'AI in healthcare',
    'drug discovery AI',
    'Alzheimer research',
    'brain age prediction',
    'AI convergence',
    'computer vision research',
    'natural language processing',
    'neural networks',
    // Development
    'full-stack developer',
    'web developer',
    'react developer',
    'nextjs developer',
    'typescript',
    'javascript',
    'python developer',
    'pytorch',
    'tensorflow',
    'langchain',
    'langgraph',
    // General
    'portfolio',
    'software engineer',
    'frontend developer',
    'backend developer',
    'Chonnam National University',
    'AI Convergence Department',
    'research publications',
  ],

  // Social media (X, formerly Twitter)
  x: {
    handle: '@yourusername',
    site: '@yourusername',
    cardType: 'summary_large_image' as const,
  },

  // Open Graph defaults
  openGraph: {
    type: 'website' as const,
    locale: 'en_US',
    siteName: INFORMATION.name,
  },

  // Images
  defaultOgImage: '/og-image.jpg',
  defaultXImage: '/x-card.jpg',

  // Author information
  author: {
    name: INFORMATION.name,
    email: INFORMATION.email,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  },

  // Organization schema - Enhanced for AI Researcher
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: INFORMATION.name,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
    sameAs: [
      INFORMATION.socialLinks.github || '',
      INFORMATION.socialLinks.linkedin || '',
      INFORMATION.socialLinks.facebook || '',
      INFORMATION.socialLinks.x || '',
      INFORMATION.socialLinks.youtube || '',
      INFORMATION.socialLinks.tiktok || '',
      INFORMATION.academicProfiles.googleScholar || '',
      INFORMATION.academicProfiles.researchGate || '',
      INFORMATION.academicProfiles.orcid || '',
    ].filter(Boolean),
    jobTitle: INFORMATION.title,
    description: INFORMATION.bio,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: INFORMATION.alumniOf.name,
    },
    affiliation: [
      {
        '@type': 'CollegeOrUniversity',
        name: INFORMATION.currentInstitution.name,
        department: INFORMATION.currentInstitution.department,
      },
      ...(INFORMATION.organization.name
        ? [
            {
              '@type': 'Organization',
              name: INFORMATION.organization.name,
            },
          ]
        : []),
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Deep Learning',
      'Medical AI',
      'Drug Discovery',
      'Alzheimer Research',
      'Brain Age Prediction',
      'Computer Vision',
      'Natural Language Processing',
      'Full-stack Development',
      'React',
      'Next.js',
      'Python',
      'PyTorch',
      'TensorFlow',
    ],
  },
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
} = {}) {
  const pageTitle = title
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaultTitle;
  const pageDescription = description || SEO_CONFIG.defaultDescription;
  const pageKeywords = keywords
    ? [...SEO_CONFIG.defaultKeywords, ...keywords]
    : SEO_CONFIG.defaultKeywords;
  const pageImage = image
    ? `${SEO_CONFIG.siteUrl}${image}`
    : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultOgImage}`;
  const pageUrl = url ? `${SEO_CONFIG.siteUrl}${url}` : SEO_CONFIG.siteUrl;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords.join(', '),
    authors: authors?.map((name) => ({ name })) || [
      { name: SEO_CONFIG.author.name },
    ],
    creator: SEO_CONFIG.author.name,
    publisher: SEO_CONFIG.author.name,
    ...(noIndex && { robots: 'noindex, nofollow' }),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type,
      locale: SEO_CONFIG.openGraph.locale,
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: SEO_CONFIG.openGraph.siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title || SEO_CONFIG.defaultTitle,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: authors || [SEO_CONFIG.author.name],
      }),
    },
    twitter: {
      card: SEO_CONFIG.x.cardType,
      title: pageTitle,
      description: pageDescription,
      creator: SEO_CONFIG.x.handle,
      site: SEO_CONFIG.x.site,
      images: [pageImage],
    },
    other: {
      'application-name': SEO_CONFIG.siteName,
    },
  };
}

export function generateArticleSchema({
  title,
  description,
  image,
  url,
  publishedTime,
  modifiedTime,
  author,
  tags,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  tags?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image ? `${SEO_CONFIG.siteUrl}${image}` : undefined,
    url: `${SEO_CONFIG.siteUrl}${url}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author,
      url: SEO_CONFIG.author.url,
    },
    publisher: {
      '@type': 'Person',
      name: SEO_CONFIG.author.name,
      url: SEO_CONFIG.author.url,
    },
    keywords: tags?.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SEO_CONFIG.siteUrl}${url}`,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    author: SEO_CONFIG.organization,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.siteUrl}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Research Project Schema for AI/ML projects
export function generateResearchProjectSchema({
  title,
  description,
  image,
  url,
  startDate,
  endDate,
  keywords,
  githubUrl,
  liveUrl,
  researchField,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  startDate?: string;
  endDate?: string;
  keywords?: string[];
  githubUrl?: string;
  liveUrl?: string;
  researchField?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: title,
    description,
    url: `${SEO_CONFIG.siteUrl}${url}`,
    ...(image && { image: `${SEO_CONFIG.siteUrl}${image}` }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    author: {
      '@type': 'Person',
      name: SEO_CONFIG.author.name,
      url: SEO_CONFIG.author.url,
    },
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(githubUrl && { codeRepository: githubUrl }),
    ...(liveUrl && { url: liveUrl }),
    ...(researchField && {
      about: researchField.map((field) => ({
        '@type': 'DefinedTerm',
        name: field,
      })),
    }),
  };
}

// Scholarly Article Schema for research papers and academic content
export function generateScholarlyArticleSchema({
  title,
  description,
  abstract,
  url,
  publishedTime,
  modifiedTime,
  author,
  keywords,
  citations,
  doi,
}: {
  title: string;
  description: string;
  abstract?: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string | string[];
  keywords?: string[];
  citations?: string[];
  doi?: string;
}) {
  const authors = Array.isArray(author) ? author : [author];

  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: title,
    description,
    ...(abstract && { abstract }),
    url: `${SEO_CONFIG.siteUrl}${url}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: authors.map((name) => ({
      '@type': 'Person',
      name,
    })),
    publisher: {
      '@type': 'Person',
      name: SEO_CONFIG.author.name,
      url: SEO_CONFIG.author.url,
    },
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(citations && {
      citation: citations.map((citation) => ({
        '@type': 'CreativeWork',
        url: citation,
      })),
    }),
    ...(doi && { sameAs: `https://doi.org/${doi}` }),
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

// FAQ Schema for AI research topics
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
