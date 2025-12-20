import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LuckyNumber } from '@/components/utilities/lucky-number';

export const metadata: Metadata = {
  title: 'Lucky Number - Random Number Generator',
  description:
    'Free online jackpot-style random number generator. Set your range and spin to get a lucky number!',
};

export default function LuckyNumberPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link
          href="/utilities"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Utilities
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lucky <span className="text-primary">Number</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jackpot-style random number generator. Set your range and spin the
            reels to pick a lucky number!
          </p>
        </div>

        {/* Tool Component */}
        <LuckyNumber />
      </div>
    </div>
  );
}
