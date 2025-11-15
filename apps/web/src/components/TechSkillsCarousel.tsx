'use client';

import { TechLogo } from './TechLogo';
import { cn } from '@/lib/utils';

interface TechSkillsCarouselProps {
  skills: string[];
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

const speedMap = {
  slow: '60s',
  normal: '40s',
  fast: '25s',
};

export function TechSkillsCarousel({
  skills,
  className,
  speed = 'normal',
}: TechSkillsCarouselProps) {
  // Duplicate skills for seamless infinite scroll
  const duplicatedSkills = [...skills, ...skills];

  return (
    <div className={cn('relative overflow-hidden py-8', className)}>
      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Infinite scrolling container */}
      <div
        className="flex gap-8 animate-scroll"
        style={{
          animation: `scroll ${speedMap[speed]} linear infinite`,
          width: 'max-content',
        }}
      >
        {duplicatedSkills.map((skill, index) => (
          <div
            key={`${skill}-${index}`}
            className="group flex items-center justify-center min-w-[120px]"
          >
            <div className="relative">
              <TechLogo
                name={skill}
                className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl dark:group-hover:shadow-primary/30"
              />
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                <span className="text-xs font-medium text-muted-foreground bg-card px-2 py-1 rounded-md shadow-md border border-border">
                  {skill}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
