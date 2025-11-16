'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ScrollButtonProps {
  targetId: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'lg' | 'sm';
  className?: string;
}

export function ScrollButton({
  targetId,
  children,
  variant = 'default',
  size = 'lg',
  className,
}: ScrollButtonProps) {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
    >
      {children}
    </Button>
  );
}

interface ContactButtonProps {
  className?: string;
}

export function ContactButton({ className }: ContactButtonProps) {
  const handleClick = () => {
    const element = document.getElementById('contact');
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="default"
      size="lg"
      className={`stellar-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all group ${className || ''}`}
    >
      Contact Me
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}

interface ViewWorkButtonProps {
  className?: string;
}

export function ViewWorkButton({ className }: ViewWorkButtonProps) {
  const handleClick = () => {
    const element = document.getElementById('projects');
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="lg"
      className={`border-2 border-primary/50 hover:border-primary hover:bg-primary/10 text-foreground hover:text-primary shadow-md hover:shadow-xl dark:shadow-primary/20 dark:hover:shadow-primary/40 transition-all duration-300 group ${className || ''}`}
    >
      View My Work
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}
