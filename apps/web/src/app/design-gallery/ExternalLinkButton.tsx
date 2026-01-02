'use client';

import { ExternalLink } from 'lucide-react';

interface ExternalLinkButtonProps {
  href: string;
  systemName: string;
}

export function ExternalLinkButton({
  href,
  systemName,
}: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="absolute top-4 right-4 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={`Visit ${systemName} website`}
    >
      <ExternalLink className="w-4 h-4" />
    </a>
  );
}
