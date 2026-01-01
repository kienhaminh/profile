import Link from 'next/link';
import { type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export interface Utility {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

export interface UtilityCardProps {
  tool: Utility;
}

export function UtilityCard({ tool }: UtilityCardProps) {
  return (
    <Link href={`/utilities/${tool.id}`} className="block h-full group">
      <div className="h-full flex flex-col p-6 bg-card border border-border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-foreground/20 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div
          className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`}
        />

        <div className="flex-grow relative z-10">
          <div className="w-12 h-12 rounded-xl bg-accent/50 border border-white/5 flex items-center justify-center mb-6 text-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
            {tool.icon}
          </div>

          <h3 className="text-xl font-medium tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
            {tool.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed font-light mb-8 line-clamp-2">
            {tool.description}
          </p>
        </div>

        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
            Try Tool
          </span>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center bg-background group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
