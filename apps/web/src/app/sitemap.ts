import { MetadataRoute } from 'next';
import { getAllProjects } from '@/services/projects';
import { listBlogs } from '@/services/blog';
import { POST_STATUS, PROJECT_STATUS } from '@/types/enums';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Get all published blog posts
  const blogsResponse = await listBlogs(POST_STATUS.PUBLISHED, {
    page: 1,
    limit: 1000, // Get all posts
  });
  const blogs = blogsResponse.data;

  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${SITE_URL}/blog/${blog.slug}`,
    lastModified: blog.publishDate ? new Date(blog.publishDate) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Get all published projects
  const projectsResponse = await getAllProjects(PROJECT_STATUS.PUBLISHED);
  const projects = projectsResponse.data;

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified: new Date(project.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...projectPages];
}
