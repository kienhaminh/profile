import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Hash, Dices, Wrench, ArrowRight } from 'lucide-react';

const tools = [
  {
    id: 'wheel-of-names',
    title: 'Spinner Wheel',
    description: 'Random picker with a spinning wheel',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'counter',
    title: 'Counter',
    description: 'Simple tally counter with sound',
    icon: <Hash className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'lucky-number',
    title: 'Lucky Number',
    description: 'Jackpot-style random number picker',
    icon: <Dices className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
  },
];

export function UtilitiesSection() {
  return (
    <section id="utilities" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-medium mb-4 shadow-lg">
            <Wrench className="w-4 h-4 mr-2" />
            Free Mini Tools
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Handy <span className="text-primary">Utilities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A collection of fun and useful mini tools. Click on any tool to try
            it out!
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/utilities/${tool.id}`}>
              <Card className="h-full group cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    {tool.icon}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    Try it now
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link href="/utilities">
            <Button size="lg" className="gap-2">
              View All Utilities
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
