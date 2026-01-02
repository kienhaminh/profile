import { Bot, Image as ImageIcon, Share2, Workflow } from 'lucide-react';
import React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  href?: string;
  component?: React.ComponentType;
}

export const toolCategories = [
  {
    id: 'social',
    name: 'Social Network Scripts',
    icon: <Share2 className="w-5 h-5" />,
    color: 'bg-blue-500',
  },
  {
    id: 'automation',
    name: 'Automation Flows',
    icon: <Workflow className="w-5 h-5" />,
    color: 'bg-orange-500',
  },
  {
    id: 'image',
    name: 'Image Generation',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'bg-purple-500',
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: <Bot className="w-5 h-5" />,
    color: 'bg-emerald-500',
  },
];

export const tools: Tool[] = [
  {
    id: 'twitter-thread-generator',
    name: 'Twitter Thread Generator',
    description: 'Create engaging Twitter threads from long-form content',
    category: 'social',
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    id: 'linkedin-post-formatter',
    name: 'LinkedIn Post Formatter',
    description: 'Format and optimize posts for LinkedIn engagement',
    category: 'social',
    icon: <Share2 className="w-4 h-4" />,
  },
  {
    id: 'content-calendar-automation',
    name: 'Content Calendar Automation',
    description: 'Automate your content scheduling workflow',
    category: 'automation',
    icon: <Workflow className="w-4 h-4" />,
  },
  {
    id: 'thumbnail-generator',
    name: 'Thumbnail Generator',
    description: 'Create professional thumbnails for blog posts',
    category: 'image',
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: 'seo-meta-generator',
    name: 'SEO Meta Generator',
    description: 'Generate SEO-optimized meta descriptions using AI',
    category: 'ai',
    icon: <Bot className="w-4 h-4" />,
  },
];
