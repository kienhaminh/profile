'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, RotateCcw, Copy, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface CounterProps {
  className?: string;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export function Counter({
  className,
  initialValue = 0,
  min = -9999,
  max = 9999,
  step = 1,
}: CounterProps) {
  const [count, setCount] = useState(initialValue);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = (type: 'increment' | 'decrement' | 'reset') => {
    if (!soundEnabled) return;

    // Create simple audio feedback
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value =
      type === 'increment' ? 800 : type === 'decrement' ? 400 : 600;
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const increment = () => {
    if (count < max) {
      setCount((prev) => Math.min(prev + step, max));
      playSound('increment');
    } else {
      toast.info(`Maximum value reached: ${max}`);
    }
  };

  const decrement = () => {
    if (count > min) {
      setCount((prev) => Math.max(prev - step, min));
      playSound('decrement');
    } else {
      toast.info(`Minimum value reached: ${min}`);
    }
  };

  const reset = () => {
    setCount(initialValue);
    playSound('reset');
    toast.success('Counter reset!');
  };

  const copyValue = () => {
    navigator.clipboard.writeText(count.toString());
    toast.success('Value copied to clipboard!');
  };

  // Determine display color based on value
  const getCountColor = () => {
    if (count > 0) return 'text-green-500';
    if (count < 0) return 'text-red-500';
    return 'text-foreground';
  };

  return (
    <Card className={`${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Counter
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyValue}
              title="Copy value"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={reset}
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {/* Counter Display */}
        <div className="relative">
          <div
            className={`text-7xl md:text-8xl font-bold tabular-nums transition-all duration-200 ${getCountColor()}`}
            style={{
              textShadow:
                count !== 0
                  ? `0 0 20px ${count > 0 ? '#22c55e40' : '#ef444440'}`
                  : 'none',
            }}
          >
            {count.toLocaleString()}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <Button
            onClick={decrement}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full text-2xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-700 transition-all duration-200 active:scale-95"
            disabled={count <= min}
          >
            <Minus className="w-8 h-8" />
          </Button>

          <Button
            onClick={increment}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full text-2xl hover:bg-green-50 hover:border-green-300 hover:text-green-600 dark:hover:bg-green-950 dark:hover:border-green-700 transition-all duration-200 active:scale-95"
            disabled={count >= max}
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 5, 10, 100].map((value) => (
            <div key={value} className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (count - value >= min) {
                    setCount((prev) => prev - value);
                    playSound('decrement');
                  }
                }}
                disabled={count - value < min}
              >
                -{value}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (count + value <= max) {
                    setCount((prev) => prev + value);
                    playSound('increment');
                  }
                }}
                disabled={count + value > max}
              >
                +{value}
              </Button>
            </div>
          ))}
        </div>

        {/* Min/Max Info */}
        <p className="text-xs text-muted-foreground">
          Range: {min.toLocaleString()} to {max.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
