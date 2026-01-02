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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Admin Tools
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                Utilities
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your personal toolkit for productivity.
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
          className={`cursor-pointer transition-all duration-300 border hover:shadow-md ${
            selectedCategory === 'all'
              ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm'
              : 'border-border/60 hover:border-primary/50 hover:bg-accent/50'
          }`}
          onClick={() => setSelectedCategory('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
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
              <div>
                <p
                  className={`font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-primary'
                      : 'text-foreground'
                  }`}
                >
                  All Tools
                </p>
                <p className="text-xs text-muted-foreground">
                  {tools.length} available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {toolCategories.map((category) => {
          const categoryTools = tools.filter(
            (tool) => tool.category === category.id
          );
          const isSelected = selectedCategory === category.id;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-300 border hover:shadow-md ${
                isSelected
                  ? 'border-primary ring-1 ring-primary/20 bg-primary/5 shadow-sm'
                  : 'border-border/60 hover:border-primary/50 hover:bg-accent/50'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? category.color : 'bg-muted'
                    }`}
                  >
                    <div
                      className={
                        isSelected ? 'text-white' : 'text-muted-foreground'
                      }
                    >
                      {category.icon}
                    </div>
                  </div>
                  <div>
                    <p
                      className={`font-semibold transition-colors ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categoryTools.length} available
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
            <Card className="border-border/60 bg-card/50">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    className="w-8 h-8 text-muted-foreground/50"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No tools found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try selecting a different category or add a new tool.
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
                className="group relative border border-border/60 bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    category?.color || 'bg-primary'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 ${
                        category?.color || 'bg-primary'
                      } rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}
                    >
                      <div className="text-white">{tool.icon}</div>
                    </div>
                    {tool.href && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                  <CardTitle className="text-lg mt-4 font-semibold group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pt-0">
                  <p className="text-sm text-muted-foreground min-h-[2.5rem] flex-1 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="pt-6 mt-auto">
                    <Button
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-transparent transition-all duration-300"
                      variant="ghost"
                      asChild
                    >
                      <Link href={`/admin/tools/${tool.id}`}>
                        Open Tool
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
                          className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
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
