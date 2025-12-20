import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import avatarImage from '@/assets/avatar.png';
import { Button } from '@/components/ui/button';
import { ContactButton, ViewWorkButton } from '@/components/ScrollButton';
import { TechSkillsCarousel } from '@/components/TechSkillsCarousel';
import { Terminal } from '@/components/Terminal';
import { BlogCard } from '@/components/blog/blog-card';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ContactForm } from '@/components/ContactForm';
import { UtilitiesSection } from '@/components/utilities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  CONTACT,
  INFORMATION,
  SKILLS,
  EXPERIENCE,
} from '@/constants/information';
import { getAllProjects } from '@/services/projects';
import { listBlogs } from '@/services/blog';
import { POST_STATUS, PROJECT_STATUS } from '@/types/enums';
import type { Project } from '@/types/project';
import type { Blog } from '@/types/blog';
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Sparkles,
  Code,
  Brain,
  Rocket,
  Facebook,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Trophy,
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
      getAllProjects(PROJECT_STATUS.PUBLISHED, { page: 1, limit: 3 }),
      listBlogs(POST_STATUS.PUBLISHED, { page: 1, limit: 3 }),
    ]);
    featuredProjects = projectsResult.data;
    recentBlogs = blogsResult.data;
  } catch (error) {
    console.warn('Failed to fetch homepage data:', error);
    // Return empty arrays if database is not available during build
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
        'AI in healthcare involves using machine learning and deep learning techniques to analyze medical data, predict disease outcomes, discover new drugs, and improve patient care. Research areas include computer vision for medical imaging, natural language processing for clinical notes, and predictive models for disease progression.',
    },
    {
      question: 'How can I collaborate on AI research projects?',
      answer:
        'You can connect with Kien Ha through GitHub, LinkedIn, or email to discuss AI research collaborations, particularly in medical AI, drug discovery, or brain-related research. Open to academic partnerships and industry collaborations.',
    },
  ]);

  return (
    <div className="min-h-screen">
      <FAQSchema data={faqSchema} />

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Summary */}
            <div className="space-y-6 z-10">
              <div className="inline-flex items-center px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-medium mb-4 shadow-lg dark:shadow-primary/20 hover:shadow-xl dark:hover:shadow-primary/30 transition-all duration-300">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                AI Researcher & Full-stack Developer
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in">
                Hi, I&apos;m{' '}
                <span className="text-primary text-glow bg-clip-text">
                  Kien Ha
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {INFORMATION.bio}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <ContactButton />

                <ViewWorkButton />
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-6">
                <Link
                  href={CONTACT.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl dark:hover:shadow-primary/50 hover:scale-110 hover:-translate-y-1"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
                <Link
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl dark:hover:shadow-primary/50 hover:scale-110 hover:-translate-y-1"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
                <Link
                  href={CONTACT.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl dark:hover:shadow-primary/50 hover:scale-110 hover:-translate-y-1"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="group p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl dark:hover:shadow-primary/50 hover:scale-110 hover:-translate-y-1"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side - Terminal */}
            <div className="flex justify-center md:justify-end z-10">
              <div className="w-full max-w-lg relative group animate-fade-in">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl blur-3xl opacity-20 group-hover:opacity-30 transition-all duration-1000 animate-pulse-glow"></div>
                <Terminal className="relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-12 items-center mb-16">
            <div className="md:col-span-4 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-secondary to-primary rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-1000 animate-pulse-glow"></div>
                <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl dark:shadow-primary/30 group-hover:shadow-3xl dark:group-hover:shadow-primary/50 transition-all duration-500 ring-2 ring-primary/20 group-hover:ring-primary/40">
                  <Image
                    src={avatarImage}
                    alt="Kien Ha"
                    width={256}
                    height={256}
                    className="w-full h-full object-cover filter blur-[0.5px] group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Gradient overlay for soft bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none"></div>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                About <span className="text-primary">Me</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
                Passionate about leveraging technology and AI to solve
                real-world problems. I combine deep technical knowledge in AI/ML
                with robust software engineering practices to build impactful
                solutions.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Experience Highlight */}
            <Card className="cosmic-card border-2 border-accent hover:border-primary group">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg dark:shadow-accent/30">
                  <Code className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  Full-stack Development
                </CardTitle>
                <CardDescription>6+ years of experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Building scalable web applications with React, Next.js,
                  TypeScript, and modern cloud technologies.
                </p>
              </CardContent>
            </Card>

            {/* AI Research */}
            <Card className="cosmic-card border-2 border-accent hover:border-primary group">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg dark:shadow-accent/30">
                  <Brain className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  AI Research
                </CardTitle>
                <CardDescription>Medical AI & Deep Learning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Master&apos;s student at Chonnam National University,
                  researching AI applications in drug discovery and brain age
                  prediction.
                </p>
              </CardContent>
            </Card>

            {/* Innovation */}
            <Card className="cosmic-card border-2 border-accent hover:border-primary group">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg dark:shadow-accent/30">
                  <Rocket className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  Innovation
                </CardTitle>
                <CardDescription>Continuous Learning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Always exploring cutting-edge technologies and methodologies
                  to deliver exceptional results.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Skills - Infinite Horizontal Scroll */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              Technical Skills
            </h3>
            <TechSkillsCarousel
              skills={[
                ...SKILLS.programmingLanguage,
                ...SKILLS.framework,
                ...SKILLS.database,
                ...SKILLS.service,
              ]}
              speed="fast"
              className="max-w-7xl mx-auto"
            />
          </div>

          {/* Experience Timeline */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              Professional Experience
            </h3>
            <div className="space-y-6">
              {EXPERIENCE.map((exp, idx) => (
                <Card
                  key={idx}
                  className="cosmic-card border border-border hover:border-primary transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg md:text-xl font-bold text-primary">
                          {exp.position}
                        </CardTitle>
                        <CardDescription className="text-base font-semibold text-foreground">
                          {exp.company}
                        </CardDescription>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent/50 text-xs font-medium text-accent-foreground border border-accent w-fit">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {exp.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      <ul className="space-y-2">
                        {exp.responsibilities.map((resp, i) => (
                          <li
                            key={i}
                            className="relative z-20 text-muted-foreground text-sm flex items-start group hover:text-primary transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2.5 text-primary shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                            <span className="leading-relaxed">{resp}</span>
                          </li>
                        ))}
                      </ul>

                      {exp.recognition && exp.recognition.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <div className="flex flex-wrap gap-2">
                            {exp.recognition.map((rec, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center text-xs text-muted-foreground bg-accent/30 px-2 py-1 rounded-md border border-accent/50"
                              >
                                <Trophy className="w-3 h-3 mr-1.5 text-yellow-500" />
                                {rec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured <span className="text-primary">Projects</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A selection of my recent work showcasing creativity and technical
              expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <Card
                key={project.id}
                className="cosmic-card h-full border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-300 group flex flex-col"
              >
                <Link href={`/projects/${project.id}`} className="flex-grow">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Link>
                <div className="p-6 pt-0 mt-auto border-t border-border/50 flex items-center justify-between gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm font-semibold text-primary hover:text-secondary transition-colors flex items-center"
                  >
                    Details <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors"
                        aria-label="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </Link>
                    )}
                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors"
                        aria-label="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/projects">
              <Button
                size="lg"
                className="stellar-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group"
              >
                View All Projects
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Latest from the <span className="text-primary">Blog</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts on AI, development, and technology
            </p>
          </div>

          {recentBlogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {recentBlogs.map((blog) => (
                <BlogCard key={blog.id} post={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-foreground mb-6">
                No blog posts yet. Check back soon!
              </p>
            </div>
          )}

          {recentBlogs.length > 0 && (
            <div className="mt-12 text-center">
              <Link href="/blog">
                <Button
                  size="lg"
                  className="stellar-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group"
                >
                  View All Posts
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Utilities Section */}
      <UtilitiesSection />

      {/* Contact Form Section */}
      <section id="contact" className="py-16 md:py-24 bg-muted">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Have a project in mind or want to collaborate? Let&apos;s talk!
            </p>
          </div>

          <Card className="cosmic-card-border border-2 border-border shadow-xl">
            <CardContent className="p-8">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
}
