'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Image as ImageIcon,
  Workflow,
  Share2,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  href?: string;
}

const toolCategories = [
  {
    id: 'social',
    name: 'Social Network Scripts',
    icon: <Share2 className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'automation',
    name: 'Automation Flows',
    icon: <Workflow className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'image',
    name: 'Image Generation',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: <Bot className="w-5 h-5" />,
    color: 'from-green-500 to-teal-500',
  },
];

export default function ToolsPage() {
  const [tools] = useState<Tool[]>([
    // Sample tools - these can be managed later
    {
      id: '1',
      name: 'Twitter Thread Generator',
      description: 'Create engaging Twitter threads from long-form content',
      category: 'social',
      icon: <Share2 className="w-4 h-4" />,
    },
    {
      id: '2',
      name: 'LinkedIn Post Formatter',
      description: 'Format and optimize posts for LinkedIn engagement',
      category: 'social',
      icon: <Share2 className="w-4 h-4" />,
    },
    {
      id: '3',
      name: 'Content Calendar Automation',
      description: 'Automate your content scheduling workflow',
      category: 'automation',
      icon: <Workflow className="w-4 h-4" />,
    },
    {
      id: '4',
      name: 'Thumbnail Generator',
      description: 'Create professional thumbnails for blog posts',
      category: 'image',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: '5',
      name: 'SEO Meta Generator',
      description: 'Generate SEO-optimized meta descriptions using AI',
      category: 'ai',
      icon: <Bot className="w-4 h-4" />,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools =
    selectedCategory === 'all'
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Tools</h1>
              <p className="text-muted-foreground mt-1">
                Your personal toolkit for productivity
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Tool
            </Button>
          </div>
        </div>

        {/* Category Filter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
              selectedCategory === 'all'
                ? 'border-primary shadow-lg dark:shadow-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">All Tools</p>
                  <p className="text-sm text-muted-foreground">{tools.length} tools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {toolCategories.map((category) => {
            const categoryTools = tools.filter(
              (tool) => tool.category === category.id
            );
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
                  selectedCategory === category.id
                    ? 'border-primary shadow-lg dark:shadow-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}
                    >
                      <div className="text-white">{category.icon}</div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {category.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {categoryTools.length} tools
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No tools found in this category
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredTools.map((tool) => {
              const category = toolCategories.find(
                (cat) => cat.id === tool.category
              );
              return (
                <Card
                  key={tool.id}
                  className="group hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 border-2 hover:border-primary cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${category?.color || 'from-gray-500 to-gray-700'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <div className="text-white">{tool.icon}</div>
                      </div>
                      {tool.href && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="flex-1">
                        Open Tool
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Add Tool Placeholder */}
        <Card className="mt-6 border-2 border-dashed hover:border-primary transition-all cursor-pointer group">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                Add a New Tool
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create custom tools for your workflow
              </p>
              <Button>Get Started</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
