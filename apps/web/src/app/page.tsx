import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import avatarImage from '@/assets/avatar.png';
import { Button } from '@/components/ui/button';
import { ContactButton, ViewWorkButton } from '@/components/ScrollButton';
import { TechSkillsCarousel } from '@/components/TechSkillsCarousel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CONTACT,
  INFORMATION,
  SKILLS,
  EXPERIENCE,
} from '@/constants/information';
import { getAllProjects } from '@/services/projects';
import { listBlogs } from '@/services/blog';
import { POST_STATUS, PROJECT_STATUS } from '@/types/enums';
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
  Clock,
  Calendar,
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
  const [{ data: featuredProjects }, { data: recentBlogs }] = await Promise.all(
    [
      getAllProjects(PROJECT_STATUS.PUBLISHED, { page: 1, limit: 3 }),
      listBlogs(POST_STATUS.PUBLISHED, { page: 1, limit: 3 }),
    ]
  );

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Summary */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Researcher & Full-stack Developer
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Hi, I&apos;m <span className="text-primary text-glow">Kien Ha</span>
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
                  className="p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href={CONTACT.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="p-3 rounded-full bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right side - Avatar */}
            <div className="flex justify-center md:justify-end">
              <div className="relative group">
                <div className="absolute -inset-2 bg-primary rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl">
                  <Image
                    src={avatarImage}
                    alt="Kien Ha"
                    width={384}
                    height={384}
                    className="w-full h-full object-cover filter blur-[0.5px]"
                    priority
                  />
                  {/* Gradient overlay for soft bottom fade */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              About <span className="text-primary">Me</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate about leveraging technology and AI to solve real-world
              problems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Experience Highlight */}
            <Card className="cosmic-card border-2 border-accent hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Full-stack Development</CardTitle>
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
            <Card className="cosmic-card border-2 border-accent hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>AI Research</CardTitle>
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
            <Card className="cosmic-card border-2 border-accent hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle>Innovation</CardTitle>
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
            <div className="space-y-8">
              {EXPERIENCE.map((exp, idx) => (
                <Card key={idx} className="border-l-4 border-primary">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <CardTitle className="text-xl">{exp.position}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {exp.period}
                      </span>
                    </div>
                    <CardDescription className="text-base">
                      {exp.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, i) => (
                        <li
                          key={i}
                          className="text-muted-foreground flex items-start"
                        >
                          <span className="mr-2 text-primary">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                    {exp.recognition && exp.recognition.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="font-semibold text-foreground mb-2">
                          Recognition
                        </h5>
                        <ul className="space-y-1">
                          {exp.recognition.map((rec, i) => (
                            <li
                              key={i}
                              className="text-muted-foreground text-sm"
                            >
                              🏆 {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="cosmic-card h-full border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
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
                    <div className="pt-2">
                      <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:text-secondary transition-colors">
                        View Project
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
              {recentBlogs.map((blog, index) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group block h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="cosmic-card h-full relative overflow-hidden border-2 border-border/50 dark:border-border/30 bg-card/80 backdrop-blur-sm hover:border-primary dark:hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1 animate-fade-in">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                    <CardHeader className="relative space-y-3 pb-3">
                      {/* Tags */}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 text-primary dark:text-primary-foreground rounded-full border border-primary/20 dark:border-primary/30 group-hover:from-primary/20 group-hover:to-secondary/20 dark:group-hover:from-primary/30 dark:group-hover:to-secondary/30 transition-all duration-300"
                            >
                              {tag.label}
                            </span>
                          ))}
                          {blog.tags.length > 2 && (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full border border-border">
                              +{blog.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      <CardTitle className="text-lg md:text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
                        {blog.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      {/* Excerpt */}
                      <p className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                        {blog.excerpt ||
                          'Discover insights and in-depth analysis on this topic...'}
                      </p>

                      {/* Footer with metadata */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {blog.publishDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(blog.publishDate)}
                            </span>
                          )}
                          {blog.readTime && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {blog.readTime} min
                            </span>
                          )}
                        </div>

                        {/* Read more arrow */}
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-secondary dark:group-hover:text-secondary transition-colors duration-300">
                          <span className="hidden sm:inline">Read</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </CardContent>

                    {/* Corner shine effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </Card>
                </Link>
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

          <Card className="cosmic-card border-2 border-border shadow-xl">
            <CardContent className="p-8">
              <form
                action={`mailto:${CONTACT.email}`}
                method="get"
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    name="body"
                    placeholder="Tell me about your project..."
                    rows={6}
                    required
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="stellar-button w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group"
                >
                  Send Message
                  <Mail className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-center text-muted-foreground mb-4">
                  Or reach out directly:
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-muted hover:bg-accent rounded-lg text-foreground transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {CONTACT.email}
                  </a>
                  <a
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-muted hover:bg-accent rounded-lg text-foreground transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
