import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import avatarImage from '@/assets/avatar.jpg';
import { CopyEmailButton } from '@/components/CopyEmailButton';
import { BlogListItem } from '@/components/blog/blog-list-item';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ProjectBentoCard } from '@/components/project-bento-card';
import { TechSkillsCarousel } from '@/components/TechSkillsCarousel';
import { ExperienceTimeline } from '@/components/experience-timeline';

import {
  CONTACT,
  INFORMATION,
  EXPERIENCE,
  SKILLS,
} from '@/constants/information';
import { getAllProjects } from '@/services/projects';
import { listBlogs } from '@/services/blog';
import { POST_STATUS, PROJECT_STATUS } from '@/types/enums';
import type { Project } from '@/types/project';
import type { Blog } from '@/types/blog';
import {
  ArrowRight,
  Brain,
  Smartphone,
  LayoutTemplate,
  Send,
} from 'lucide-react';
import {
  generateMetadata as generateSEOMetadata,
  generateFAQSchema,
} from '@/config/seo';
import { FAQSchema } from '@/components/seo/JsonLd';

// Enhanced home page metadata
export const metadata: Metadata = generateSEOMetadata({
  title: undefined,
  description: undefined,
  keywords: [
    'full-stack developer portfolio',
    'AI researcher',
    'react developer',
    'nextjs expert',
    'typescript developer',
    'machine learning',
    'medical AI',
    'web application development',
  ],
  url: '/',
});

export default async function Home() {
  let featuredProjects: Project[] = [];
  let recentBlogs: Blog[] = [];

  try {
    const [projectsResult, blogsResult] = await Promise.all([
      getAllProjects(PROJECT_STATUS.PUBLISHED, { page: 1, limit: 4 }),
      listBlogs(POST_STATUS.PUBLISHED, { page: 1, limit: 3 }),
    ]);
    featuredProjects = projectsResult.data;
    recentBlogs = blogsResult.data;
  } catch (error) {
    console.warn('Failed to fetch homepage data:', error);
  }

  // FAQ Schema for AI Research
  const faqSchema = generateFAQSchema([
    {
      question: 'What is Kien Ha researching in AI?',
      answer:
        "Kien Ha is a Master's student at Chonnam National University in the Department of AI Convergence, focusing on applying artificial intelligence to medical fields including drug discovery, Alzheimer's disease research, and brain age prediction.",
    },
    {
      question: 'What AI technologies and frameworks does Kien Ha use?',
      answer:
        'Kien Ha works with PyTorch, TensorFlow, LangChain, LangGraph for AI development, combined with full-stack technologies like React, Next.js, TypeScript, Python, and modern cloud infrastructure on AWS.',
    },
    {
      question: 'What is AI in healthcare and medical research?',
      answer:
        'AI in healthcare involves using machine learning and deep learning techniques to analyze medical data, predict disease outcomes, discover new drugs, and improve patient care.',
    },
    {
      question: 'How can I collaborate on AI research projects?',
      answer:
        'You can connect with Kien Ha through GitHub, LinkedIn, or email to discuss AI research collaborations, particularly in medical AI, drug discovery, or brain-related research.',
    },
  ]);

  // Determine mockup types for projects
  const getMockupType = (
    index: number
  ): 'dashboard' | 'phone' | 'code' | 'layers' => {
    const types: ('dashboard' | 'phone' | 'code' | 'layers')[] = [
      'dashboard',
      'phone',
      'code',
      'layers',
    ];
    return types[index % types.length];
  };

  return (
    <div className="min-h-screen">
      <FAQSchema data={faqSchema} />

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="mb-32 relative">
          {/* Avatar with ambient glow */}
          {/* Hero Avatar */}
          <div className="mb-8">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-800 grayscale hover:grayscale-0 transition-all duration-500 shadow-2xl">
              <Image
                src={avatarImage}
                alt="Kien Ha"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Status Badge with Ping Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Available for new projects
          </div>

          {/* Main Heading with Gradient */}
          <h1 className="text-5xl md:text-7xl font-medium text-foreground tracking-tight mb-6 leading-[1.1]">
            Crafting digital <br />
            <span className="gradient-text-hero">experiences with code.</span>
          </h1>

          {/* Bio */}
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10 font-light">
            {INFORMATION.bio}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#work">
              <Button className="group relative px-6 py-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors">
                <span className="flex items-center gap-2">
                  View Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <CopyEmailButton email={CONTACT.email} />
          </div>
        </section>

        {/* Projects (Bento Grid) */}
        <section id="work" className="mb-32">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-2xl font-medium text-foreground tracking-tight">
              Selected Work
            </h2>
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
            >
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]">
              {featuredProjects.slice(0, 4).map((project, index) => {
                // First project is large (2 cols), second is tall (2 rows), rest are standard
                const size =
                  index === 0 ? 'large' : index === 1 ? 'tall' : 'standard';
                return (
                  <ProjectBentoCard
                    key={project.id}
                    project={project}
                    size={size}
                    mockupType={getMockupType(index)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-border rounded-2xl bg-card/30">
              <p className="text-muted-foreground">
                Projects coming soon. Check back later!
              </p>
            </div>
          )}
        </section>

        {/* Tech Stack - Infinite Horizontal Scroll */}
        <section id="stack" className="mb-32">
          <h2 className="text-2xl font-medium text-foreground tracking-tight mb-8">
            Technologies
          </h2>
          <TechSkillsCarousel
            skills={[
              ...SKILLS.programmingLanguage,
              ...SKILLS.framework,
              ...SKILLS.database,
              ...SKILLS.service,
            ]}
            speed="fast"
          />
        </section>

        {/* Blog Section (List Format) */}
        <section id="blog" className="mb-32">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-medium text-foreground tracking-tight">
              Writing
            </h2>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
            >
              Read more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentBlogs.length > 0 ? (
            <div className="border-t border-border">
              {recentBlogs.map((blog) => (
                <BlogListItem key={blog.id} post={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-t border-border">
              <p className="text-muted-foreground">
                No posts yet. Check back soon!
              </p>
            </div>
          )}
        </section>

        {/* Experience + Services (Side by Side) */}
        <section id="about" className="grid md:grid-cols-2 gap-12 mb-32">
          {/* Experience Column */}
          <div>
            <h2 className="text-2xl font-medium text-foreground tracking-tight mb-6">
              Experience
            </h2>
            <ExperienceTimeline
              experiences={EXPERIENCE.map((exp) => ({
                position: exp.position,
                company: exp.company,
                period: exp.period,
                responsibilities: exp.responsibilities,
                recognition: exp.recognition,
              }))}
            />
          </div>

          {/* Services Column */}
          <div>
            <h2 className="text-2xl font-medium text-foreground tracking-tight mb-6">
              Services
            </h2>
            <div className="space-y-4">
              {/* Service: Web Development */}
              <div className="group p-4 border border-border rounded-xl bg-card/20 hover:bg-card/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <LayoutTemplate className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <h3 className="text-sm font-medium text-foreground">
                    Web Development
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  High performance websites built with modern frameworks.
                </p>
              </div>

              {/* Service: AI/ML Solutions */}
              <div className="group p-4 border border-border rounded-xl bg-card/20 hover:bg-card/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <h3 className="text-sm font-medium text-foreground">
                    AI/ML Solutions
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Machine learning models and AI-powered applications.
                </p>
              </div>

              {/* Service: Mobile Apps */}
              <div className="group p-4 border border-border rounded-xl bg-card/20 hover:bg-card/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <h3 className="text-sm font-medium text-foreground">
                    Mobile Apps
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cross-platform mobile applications using React Native.
                </p>
              </div>
            </div>

            {/* CTA Card */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Let&apos;s work together
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Have a project in mind? Let&apos;s turn your idea into
                  reality.
                </p>
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2 text-sm text-foreground font-medium border-b border-foreground/30 pb-0.5 hover:border-foreground transition-colors"
                >
                  Send me an email
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                <Send className="w-16 h-16" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <ChatWidget />
    </div>
  );
}
