import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Counter } from '@/components/utilities/counter';

export const metadata: Metadata = {
  title: 'Counter - Online Tally Counter',
  description:
    'Free online tally counter with sound feedback. Perfect for counting anything!',
};

export default function CounterPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            Tally <span className="text-primary">Counter</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple yet powerful counter. Great for tracking counts, keeping
            score, or any counting needs!
          </p>
        </div>

        {/* Tool Component */}
        <Counter />
      </div>
    </div>
  );
}
