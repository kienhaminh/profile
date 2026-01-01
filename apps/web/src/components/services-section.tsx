import type { JSX } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Code,
  Brain,
  Palette,
  Server,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const services: ServiceItem[] = [
  {
    icon: <Code className="w-5 h-5" />,
    title: 'Full-stack Development',
    description:
      'Modern web applications with React, Next.js, TypeScript, and cloud infrastructure.',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'AI/ML Solutions',
    description:
      'Machine learning models, LLM integrations, and AI-powered applications.',
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'UI/UX Design',
    description:
      'Clean, intuitive interfaces with attention to detail and user experience.',
  },
  {
    icon: <Server className="w-5 h-5" />,
    title: 'API Development',
    description:
      'Scalable REST/GraphQL APIs with proper authentication and documentation.',
  },
];

interface ServicesSectionProps {
  className?: string;
}

/**
 * ServicesSection - Displays services/expertise with CTA card.
 * Following the reference design with icon cards and gradient CTA.
 */
export function ServicesSection({ className }: ServicesSectionProps): JSX.Element {
  return (
    <section
      id="services"
      className={cn('py-16 md:py-24 bg-background', className)}
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-2">
            What I Do
          </h2>
          <p className="text-muted-foreground">
            Expertise across the full development stack
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {services.map((service) => (
            <div
              key={service.title}
              className="group p-6 rounded-xl border border-border bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {service.icon}
              </div>
              <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />

          {/* Background icon */}
          <MessageSquare className="absolute right-8 bottom-8 w-32 h-32 text-muted-foreground/5 transition-opacity group-hover:opacity-10" />

          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-medium text-foreground mb-3">
              Have a project in mind?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg">
              I&apos;m always open to discussing new opportunities, collaborations,
              or just having a chat about technology.
            </p>
            <Link href="#contact">
              <Button className="group/btn bg-foreground text-background hover:bg-foreground/90 rounded-lg px-6">
                Get in Touch
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
