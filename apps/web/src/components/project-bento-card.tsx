import type { JSX } from 'react';
import Link from 'next/link';
import {
  DashboardMockup,
  PhoneMockup,
  CodeMockup,
  LayersMockup,
} from '@/components/ui/abstract-mockups';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

type MockupType = 'dashboard' | 'phone' | 'code' | 'layers';
type CardSize = 'large' | 'tall' | 'standard';

interface ProjectBentoCardProps {
  project: Project;
  size: CardSize;
  mockupType?: MockupType;
  className?: string;
}

const sizeClasses: Record<CardSize, string> = {
  large: 'md:col-span-2',
  tall: 'md:row-span-2',
  standard: '',
};

const mockupComponents: Record<MockupType, React.ComponentType<{ className?: string }>> = {
  dashboard: DashboardMockup,
  phone: PhoneMockup,
  code: CodeMockup,
  layers: LayersMockup,
};

/**
 * ProjectBentoCard - A bento grid card for showcasing projects with abstract UI mockups.
 *
 * Features:
 * - Grid overlay pattern
 * - Gradient fade at bottom
 * - Abstract mockup based on project type
 * - Hover animations
 * - Tag and description overlay
 */
export function ProjectBentoCard({
  project,
  size,
  mockupType = 'dashboard',
  className,
}: ProjectBentoCardProps): JSX.Element {
  const MockupComponent = mockupComponents[mockupType];
  const href = project.liveUrl || project.githubUrl || `/projects/${project.slug}`;

  const cardContent = (
    <>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Bottom gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

      {/* Abstract mockup */}
      {mockupType === 'code' || mockupType === 'layers' ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <MockupComponent />
        </div>
      ) : (
        <MockupComponent />
      )}

      {/* Content overlay */}
      <div className="absolute bottom-6 left-6 z-20">
        {project.tags && project.tags.length > 0 && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mb-2 inline-block">
            {project.tags[0].label}
          </span>
        )}
        <h3 className="text-xl font-medium text-foreground">{project.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-[280px]">
          {project.description}
        </p>
      </div>
    </>
  );

  const cardClasses = cn(
    'group relative bg-card/40 border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 h-[300px]',
    sizeClasses[size],
    className
  );

  // If there's a link, wrap in Link component
  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
}

export default ProjectBentoCard;
