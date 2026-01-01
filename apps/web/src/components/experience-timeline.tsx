import type { JSX } from 'react';
import { cn } from '@/lib/utils';

export interface Experience {
  position: string;
  company: string;
  period: string;
  responsibilities?: string[];
  recognition?: string[];
}

interface ExperienceTimelineProps {
  experiences: Experience[];
  className?: string;
}

/**
 * ExperienceTimeline - Displays work experience in a vertical timeline format.
 * Following the reference design with left border and dots.
 */
export function ExperienceTimeline({
  experiences,
  className,
}: ExperienceTimelineProps): JSX.Element {
  return (
    <div className={cn('space-y-8', className)}>
      {experiences.map((exp, idx) => (
        <div key={idx} className="relative pl-8 border-l border-border">
          {/* Timeline dot */}
          <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />

          {/* Header with position and date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
            <h3 className="text-foreground font-medium">{exp.position}</h3>
            <span className="text-xs font-mono text-muted-foreground">
              {exp.period}
            </span>
          </div>

          {/* Company */}
          <div className="text-sm text-muted-foreground mb-2">
            {exp.company}
          </div>

          {/* Responsibilities summary */}
          {exp.responsibilities && exp.responsibilities.length > 0 && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {exp.responsibilities.slice(0, 2).join(' ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ExperienceTimeline;
