import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbSchema } from '@/config/seo';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog',
  description:
    'Read articles about web development, AI, TypeScript, React, Next.js, and modern software engineering practices. Technical insights and tutorials from a full-stack developer.',
  keywords: [
    'blog',
    'web development',
    'typescript',
    'react',
    'nextjs',
    'AI',
    'programming',
    'software engineering',
    'tutorials',
    'tech articles',
  ],
  url: '/blog',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ]);

  return (
    <>
      <BreadcrumbSchema data={breadcrumbSchema} />
      {children}
    </>
  );
}
