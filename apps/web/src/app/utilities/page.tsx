import { Metadata } from 'next';
import { UtilityCard, type Utility } from '@/components/utilities';
import { Users, Hash, Dices, ImageIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Utilities - Free Mini Tools',
  description:
    'A collection of free, fun mini tools including Spinner Wheel, Counter, and Lucky Number.',
};

const tools: Utility[] = [
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
    <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
      {/* Header Section */}
      <section className="mb-32 relative">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
          Handy <span className="gradient-text-hero">Utilities</span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-light mb-10">
          A curated collection of professional-grade mini tools designed to
          enhance your daily workflow. Free, fast, and secure.
        </p>
      </section>

      {/* Tools Section */}
      <section id="tools" className="mb-32">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-2xl font-medium text-foreground tracking-tight">
            Tool Collection
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 stagger-item">
          {tools.map((tool) => (
            <UtilityCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </main>
  );
}
