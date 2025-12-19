'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import { toolCategories, tools } from './registry';
import Link from 'next/link';

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools =
    selectedCategory === 'all'
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory);

  return (
    <div className="space-y-6">
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
                <div className="text-white">
                  {/* Default icon for "All" */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">All Tools</p>
                <p className="text-sm text-muted-foreground">
                  {tools.length} tools
                </p>
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
                className="group hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 border-2 hover:border-primary cursor-pointer flex flex-col"
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
                        asChild
                      >
                        <a
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground min-h-[2.5rem] flex-1">
                    {tool.description}
                  </p>
                  <div className="pt-4 flex gap-2 mt-auto">
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/admin/tools/${tool.id}`}>Open Tool</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
