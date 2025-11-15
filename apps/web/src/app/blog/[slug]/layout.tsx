import { Metadata } from 'next';
import { getPostBySlug } from '@/services/posts';
import {
  generateMetadata as generateSEOMetadata,
  generateArticleSchema,
  generateScholarlyArticleSchema,
} from '@/config/seo';
import {
  ArticleSchema,
  ScholarlyArticleSchema,
} from '@/components/seo/JsonLd';

interface BlogLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    return generateSEOMetadata({
      title: post.title,
      description: post.excerpt || undefined,
      keywords: post.tags.map((tag) => tag.label),
      image: post.coverImage || undefined,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishDate || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
    });
  } catch {
    // If post not found, return basic metadata
    return generateSEOMetadata({
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
      noIndex: true,
    });
  }
}

export default async function BlogLayout({ children, params }: BlogLayoutProps) {
  const { slug } = await params;

  let articleSchema = null;
  let isScholarlyArticle = false;

  try {
    const post = await getPostBySlug(slug);

    // Detect if this is a research paper/scholarly article
    const researchKeywords = [
      'research',
      'paper',
      'study',
      'ai',
      'ml',
      'machine learning',
      'deep learning',
      'neural network',
      'medical',
      'healthcare',
      'drug discovery',
      'alzheimer',
      'brain',
      'academic',
      'publication',
      'experiment',
      'dataset',
      'model',
      'algorithm',
    ];

    const tags = post.tags.map((tag) => tag.label.toLowerCase());
    const titleLower = post.title.toLowerCase();
    const excerptLower = (post.excerpt || '').toLowerCase();

    isScholarlyArticle =
      tags.some((tag) =>
        researchKeywords.some((keyword) => tag.includes(keyword))
      ) ||
      researchKeywords.some(
        (keyword) => titleLower.includes(keyword) || excerptLower.includes(keyword)
      );

    if (isScholarlyArticle) {
      // Use ScholarlyArticle schema for research content
      articleSchema = generateScholarlyArticleSchema({
        title: post.title,
        description: post.excerpt || post.title,
        abstract: post.excerpt || undefined,
        url: `/blog/${post.slug}`,
        publishedTime: post.publishDate || new Date().toISOString(),
        modifiedTime: post.updatedAt,
        author: post.author.name,
        keywords: post.tags.map((tag) => tag.label),
      });
    } else {
      // Use regular BlogPosting schema for blog posts
      articleSchema = generateArticleSchema({
        title: post.title,
        description: post.excerpt || post.title,
        image: post.coverImage || undefined,
        url: `/blog/${post.slug}`,
        publishedTime: post.publishDate || new Date().toISOString(),
        modifiedTime: post.updatedAt,
        author: post.author.name,
        tags: post.tags.map((tag) => tag.label),
      });
    }
  } catch {
    // Post not found, let the page component handle the 404
  }

  return (
    <>
      {articleSchema && isScholarlyArticle && (
        <ScholarlyArticleSchema data={articleSchema} />
      )}
      {articleSchema && !isScholarlyArticle && (
        <ArticleSchema data={articleSchema} />
      )}
      {children}
    </>
  );
}
