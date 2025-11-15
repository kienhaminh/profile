import { Metadata } from 'next';
import { getProjectById } from '@/services/projects';
import {
  generateMetadata as generateSEOMetadata,
  generateBreadcrumbSchema,
  generateResearchProjectSchema,
} from '@/config/seo';
import {
  BreadcrumbSchema,
  JsonLd,
  ResearchProjectSchema,
} from '@/components/seo/JsonLd';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProjectLayoutProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const project = await getProjectById(id);

    return generateSEOMetadata({
      title: project.title,
      description: project.description || undefined,
      keywords: project.tags.map((tag) => tag.label),
      image: project.images?.[0] || undefined,
      url: `/projects/${project.id}`,
      type: 'article',
      modifiedTime: project.updatedAt,
    });
  } catch {
    return generateSEOMetadata({
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
      noIndex: true,
    });
  }
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;

  let breadcrumbSchema = null;
  let projectSchema = null;

  try {
    const project = await getProjectById(id);

    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Projects', url: '/projects' },
      { name: project.title, url: `/projects/${project.id}` },
    ]);

    // Detect if project is AI/Research related
    const researchKeywords = [
      'ai',
      'ml',
      'machine learning',
      'deep learning',
      'neural network',
      'nlp',
      'computer vision',
      'research',
      'medical',
      'healthcare',
      'drug',
      'alzheimer',
      'brain',
      'pytorch',
      'tensorflow',
      'langchain',
    ];

    const tags = project.tags.map((tag) => tag.label.toLowerCase());
    const isResearchProject = tags.some((tag) =>
      researchKeywords.some((keyword) => tag.includes(keyword))
    );

    // Use ResearchProject schema for AI/Research projects, CreativeWork for others
    if (isResearchProject) {
      // Identify research fields from tags
      const researchFields = tags.filter((tag) =>
        researchKeywords.some((keyword) => tag.includes(keyword))
      );

      projectSchema = generateResearchProjectSchema({
        title: project.title,
        description: project.description || project.title,
        image: project.images?.[0],
        url: `/projects/${project.id}`,
        startDate: project.startDate || project.createdAt,
        endDate: project.endDate || undefined,
        keywords: project.tags.map((tag) => tag.label),
        githubUrl: project.githubUrl || undefined,
        liveUrl: project.liveUrl || undefined,
        researchField: researchFields.length > 0 ? researchFields : undefined,
      });
    } else {
      // CreativeWork schema for non-research projects
      projectSchema = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        image: project.images?.[0],
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/projects/${project.id}`,
        dateCreated: project.startDate || project.createdAt,
        dateModified: project.updatedAt,
        keywords: project.tags.map((tag) => tag.label).join(', '),
        author: {
          '@type': 'Person',
          name: process.env.NEXT_PUBLIC_CONTACT_NAME || 'Ha Minh Kien',
        },
        ...(project.githubUrl && { codeRepository: project.githubUrl }),
        ...(project.liveUrl && { sameAs: project.liveUrl }),
      };
    }
  } catch {
    // Project not found, let the page component handle the 404
  }

  return (
    <>
      {breadcrumbSchema && <BreadcrumbSchema data={breadcrumbSchema} />}
      {projectSchema && projectSchema['@type'] === 'ResearchProject' && (
        <ResearchProjectSchema data={projectSchema} />
      )}
      {projectSchema && projectSchema['@type'] === 'CreativeWork' && (
        <JsonLd data={projectSchema} />
      )}
      {children}
    </>
  );
}
