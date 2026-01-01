import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { WheelOfNames } from '@/components/utilities/wheel-of-names';

export const metadata: Metadata = {
  title: 'Spinner Wheel - Random Picker',
  description:
    'Free online spinning wheel for random selection. Add names, prizes, or any items and spin to pick!',
};

export default function WheelOfNamesPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/utilities"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <span className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Utilities
          </span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Spinner <span className="text-primary">Wheel</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add names, prizes, or any items and spin the wheel to randomly
            select a winner. Perfect for giveaways, games, or making decisions!
          </p>
        </div>

        {/* Tool Component */}
        <WheelOfNames />
      </div>
    </div>
  );
}
