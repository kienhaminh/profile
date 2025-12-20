import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Hash, Dices, Wrench, ArrowLeft, ImageIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Utilities - Free Mini Tools',
  description:
    'A collection of free, fun mini tools including Spinner Wheel, Counter, and Lucky Number.',
};

const tools = [
  {
    id: 'wheel-of-names',
    title: 'Spinner Wheel',
    description:
      'Random picker with a spinning wheel. Add names, prizes, or any items and spin to select!',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'counter',
    title: 'Counter',
    description:
      'Simple tally counter with sound feedback. Great for counting anything!',
    icon: <Hash className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'lucky-number',
    title: 'Lucky Number',
    description:
      'Jackpot-style random number picker. Set your range and spin the reels!',
    icon: <Dices className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'favicon-converter',
    title: 'Favicon Converter',
    description:
      'Generate all favicon formats for any platform - iOS, Android, Windows & browsers.',
    icon: <ImageIcon className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
  },
];

export default function UtilitiesPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-medium mb-4 shadow-lg">
            <Wrench className="w-4 h-4 mr-2" />
            Free Mini Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Handy <span className="text-primary">Utilities</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A collection of fun and useful mini tools. Click on any tool to get
            started!
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/utilities/${tool.id}`}>
              <Card className="h-full group cursor-pointer border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    {tool.icon}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors text-xl">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
