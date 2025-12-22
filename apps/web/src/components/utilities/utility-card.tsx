import Link from 'next/link';
import { type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
    <Link href={`/utilities/${tool.id}`}>
      <Card className="h-full flex flex-col group cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
        <CardHeader className="flex-grow">
          <div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
          >
            {tool.icon}
          </div>
          <CardTitle className="group-hover:text-primary transition-colors text-xl">
            {tool.title}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {tool.description}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full relative overflow-hidden border-2 transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20"
          >
            <div className="absolute inset-0 bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-primary-foreground transition-colors duration-300">
              Open Tool
              <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 delay-100" />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
