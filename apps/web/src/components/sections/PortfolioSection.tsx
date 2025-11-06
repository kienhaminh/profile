import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { filterProjectsByTag } from './portfolio-helpers';

interface PortfolioSectionProps {
  projects: Project[];
}

export function PortfolioSection({ projects }: PortfolioSectionProps) {
  const allTab = { slug: 'all', label: 'All' } as const;

  const tagTabs = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => p.tags.forEach((t) => map.set(t.slug, t.label)));
    return [
      allTab,
      ...Array.from(map.entries()).map(([slug, label]) => ({ slug, label })),
    ];
  }, [projects]);

  const [active, setActive] = useState<string>(allTab.slug);
  const filtered = useMemo(
    () => filterProjectsByTag(projects, active === allTab.slug ? null : active),
    [projects, active]
  );

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            My Recent{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A curated selection of projects I loved building.
          </p>
        </div>

        <Tabs value={active} onValueChange={setActive} className="w-full">
          <div className="flex justify-center">
            <TabsList className="flex flex-wrap gap-2">
              {tagTabs.map((t) => (
                <TabsTrigger key={t.slug} value={t.slug} className="capitalize">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={active} className="mt-10" forceMount>
            {filtered.length === 0 ? (
              <div className="text-center text-gray-500">
                No projects found.
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group block"
                  >
                    <Card className="h-full border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="relative">
                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors flex items-center justify-between">
                          {project.title}
                          <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        {project.images && project.images[0] && (
                          <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-100">
                            <Image
                              src={project.images[0]}
                              alt={project.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                            />
                          </div>
                        )}
                        <p className="text-gray-600 line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full border border-blue-200"
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                        <div className="pt-2">
                          <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-purple-600 transition-colors">
                            View Project
                            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Link href="/projects">
            <Button
              size="lg"
              className="animated-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Explore All Projects
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PortfolioSection;



