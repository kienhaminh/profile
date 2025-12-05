'use client';

import { notFound, useParams } from 'next/navigation';
import { tools } from '../registry';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SeoGenerator } from '@/components/tools/seo-generator';
import { ThumbnailGenerator } from '@/components/tools/thumbnail-generator';

export default function ToolPage() {
  const params = useParams();
  const toolId = params.id as string;
  const tool = tools.find((t) => t.id === toolId);

  if (!tool) {
    notFound();
  }

  // Map tool IDs to components
  // In a larger app, this could be dynamic or lazy loaded
  const renderToolComponent = () => {
    switch (toolId) {
      case 'seo-meta-generator':
        return <SeoGenerator />;
      case 'thumbnail-generator':
        return <ThumbnailGenerator />;
      default:
        return (
          <div className="p-12 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              This tool is currently under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/tools"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tools
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            {tool.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
            <p className="text-muted-foreground mt-1">{tool.description}</p>
          </div>
        </div>
      </div>

      {renderToolComponent()}
    </div>
  );
}
