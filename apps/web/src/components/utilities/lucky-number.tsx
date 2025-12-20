'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RotateCcw, Play, Sparkles, X, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface LuckyNumberProps {
  className?: string;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const CONFETTI_COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#DDA0DD',
  '#F7DC6F',
  '#BB8FCE',
  '#FF69B4',
  '#00CED1',
];
const CELEBRATION_EMOJIS = [
  '🎉',
  '🎊',
  '✨',
  '🌟',
  '💫',
  '⭐',
  '🏆',
  '👏',
  '🥳',
  '🎯',
];

export function LuckyNumber({ className }: LuckyNumberProps) {
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(100);
  const [numDigits, setNumDigits] = useState(2);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayDigits, setDisplayDigits] = useState<string[]>(['0', '0']);
  const [winner, setWinner] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Update digit count based on max value
  useEffect(() => {
    const digits = Math.max(
      maxValue.toString().length,
      minValue.toString().length
    );
    setNumDigits(digits);
    setDisplayDigits(Array(digits).fill('0'));
  }, [minValue, maxValue]);

  const spin = useCallback(() => {
    if (minValue > maxValue) {
      toast.error('Min value cannot be greater than max value!');
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setShowCelebration(false);

    // Generate random number in range
    const result =
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    const resultStr = result.toString().padStart(numDigits, '0');

    // Animate each digit with staggered timing
    const spinDuration = 2000;
    const intervalTime = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalTime;

      // Calculate which digits should still be spinning
      const progress = elapsed / spinDuration;

      setDisplayDigits((prev) => {
        return prev.map((_, i) => {
          // Each digit stops at a different time (left to right)
          const digitStopProgress = (i + 1) / numDigits;
          if (progress >= digitStopProgress) {
            return resultStr[i];
          }
          // Still spinning - show random digit
          return DIGITS[Math.floor(Math.random() * 10)];
        });
      });

      if (elapsed >= spinDuration) {
        clearInterval(interval);
        setDisplayDigits(resultStr.split(''));
        setWinner(result);
        setIsSpinning(false);
        setShowCelebration(true);
      }
    }, intervalTime);
  }, [minValue, maxValue, numDigits]);

  const reset = () => {
    setDisplayDigits(Array(numDigits).fill('0'));
    setWinner(null);
    setShowCelebration(false);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  return (
    <>
      {/* Fullscreen Celebration Popup */}
      {showCelebration && winner !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden"
          onClick={closeCelebration}
        >
          {/* Rotating Light Rays Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin-slow w-[200vmax] h-[200vmax]">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-full h-4 origin-left"
                  style={{
                    transform: `rotate(${i * 30}deg) translateX(-50%)`,
                    background: `linear-gradient(90deg, rgba(255,215,0,0.3) 0%, transparent 70%)`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Fireworks */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={`firework-${i}`}
                className="absolute animate-firework"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 40}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {[...Array(12)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-2 h-2 rounded-full animate-firework-particle"
                    style={{
                      backgroundColor:
                        CONFETTI_COLORS[(i + j) % CONFETTI_COLORS.length],
                      transform: `rotate(${j * 30}deg) translateY(-30px)`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Fullscreen Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(150)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  width: `${6 + Math.random() * 14}px`,
                  height: `${6 + Math.random() * 14}px`,
                  backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  borderRadius:
                    Math.random() > 0.5
                      ? '50%'
                      : Math.random() > 0.5
                        ? '0'
                        : '2px',
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* Floating Emojis */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={`emoji-${i}`}
                className="absolute text-4xl animate-float-up"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  bottom: `-10%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              >
                {CELEBRATION_EMOJIS[i % CELEBRATION_EMOJIS.length]}
              </div>
            ))}
          </div>

          {/* Celebration Content */}
          <div
            className="relative z-10 text-center p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeCelebration}
              className="absolute -top-4 -right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-20"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Glowing Ring Behind Trophy */}
            <div className="relative mb-6">
              {/* Pulsing rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-yellow-400/50 animate-ping-slow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-2 border-yellow-300/30 animate-ping-slower" />
              </div>

              {/* Trophy Animation */}
              <div className="relative animate-bounce-slow">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full shadow-2xl animate-glow">
                  <Trophy className="w-12 h-12 text-white drop-shadow-lg animate-wiggle" />
                </div>
              </div>
            </div>

            {/* Congratulations Text with Rainbow Effect */}
            <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-rainbow-text">
              🎉 CONGRATULATIONS! 🎉
            </h2>

            {/* Subtitle with typewriter effect feel */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up">
              ✨ Your Lucky Number is ✨
            </p>

            {/* Big Number Display with enhanced effects */}
            <div className="relative inline-flex gap-3 mb-8">
              {/* Glow behind numbers */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/30 to-yellow-400/20 blur-2xl animate-pulse" />

              {winner
                .toString()
                .split('')
                .map((digit, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-20 md:w-24 md:h-32 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-2xl animate-pop-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl animate-shimmer overflow-hidden" />

                    <span className="relative text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                      {digit}
                    </span>
                  </div>
                ))}
            </div>

            {/* Sparkle decorations - enhanced */}
            <div className="flex justify-center gap-3 mb-8">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="relative">
                  <Sparkles
                    className="w-8 h-8 text-yellow-400 animate-sparkle"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                  <div
                    className="absolute inset-0 bg-yellow-400/50 blur-md animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                </div>
              ))}
            </div>

            {/* Celebration message */}
            <p className="text-lg text-white/70 mb-6 animate-fade-in">
              🎯 You&apos;re a winner! 🎯
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  closeCelebration();
                  spin();
                }}
                size="lg"
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg text-lg animate-pulse-soft"
              >
                <Play className="w-5 h-5" />
                Spin Again
              </Button>
              <Button
                onClick={closeCelebration}
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className || ''}`}
      >
        {/* Jackpot Display */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Machine Frame */}
          <div className="relative">
            {/* Decorative top */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold shadow-lg">
                <Sparkles className="w-5 h-5" />
                JACKPOT
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Number Display */}
            <div className="mt-8 flex gap-2 p-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl border-4 border-yellow-500">
              {displayDigits.map((digit, index) => (
                <div
                  key={index}
                  className="relative w-16 h-24 md:w-20 md:h-28 bg-gradient-to-b from-gray-100 to-white rounded-lg shadow-inner overflow-hidden"
                >
                  {/* Digit */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-5xl md:text-6xl font-bold text-gray-900 transition-all ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                    style={{
                      textShadow:
                        winner !== null
                          ? '0 0 20px rgba(255, 215, 0, 0.5)'
                          : 'none',
                    }}
                  >
                    {digit}
                  </div>

                  {/* Reel effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Lever / Spin Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={spin}
                disabled={isSpinning}
                size="lg"
                className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg text-lg px-8"
              >
                <Play
                  className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`}
                />
                {isSpinning ? 'Spinning...' : 'SPIN!'}
              </Button>
            </div>
          </div>

          {/* Small Winner Display (shown after popup closes) */}
          {winner !== null && !isSpinning && !showCelebration && (
            <div className="mt-8 text-center">
              <p className="text-2xl font-bold text-primary">
                Last result: {winner}
              </p>
            </div>
          )}
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Settings
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="minValue">Minimum Number</Label>
              <Input
                id="minValue"
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(parseInt(e.target.value) || 0)}
                min={0}
                max={999999}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxValue">Maximum Number</Label>
              <Input
                id="maxValue"
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(parseInt(e.target.value) || 0)}
                min={0}
                max={999999}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Range:{' '}
                <span className="font-mono font-bold text-foreground">
                  {minValue}
                </span>{' '}
                to{' '}
                <span className="font-mono font-bold text-foreground">
                  {maxValue}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ({(maxValue - minValue + 1).toLocaleString()} possible numbers)
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Quick Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinValue(1);
                    setMaxValue(10);
                  }}
                >
                  1 - 10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinValue(1);
                    setMaxValue(100);
                  }}
                >
                  1 - 100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinValue(1);
                    setMaxValue(1000);
                  }}
                >
                  1 - 1000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinValue(0);
                    setMaxValue(999999);
                  }}
                >
                  Lottery
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Animation styles */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(1080deg) scale(0.3);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }

        @keyframes scale-in {
          0% {
            transform: scale(0.3) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(3deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        @keyframes pop-in {
          0% {
            transform: scale(0) rotate(-20deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(10deg);
          }
          70% {
            transform: scale(0.9) rotate(-5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-pop-in {
          animation: pop-in 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) scale(1.5) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up linear infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes firework {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-firework {
          animation: firework 2s ease-out infinite;
        }

        @keyframes firework-particle {
          0% {
            transform: rotate(var(--rotation)) translateY(0);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation)) translateY(-80px);
            opacity: 0;
          }
        }
        .animate-firework-particle {
          animation: firework-particle 1s ease-out infinite;
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-out infinite;
        }

        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping-slower {
          animation: ping-slower 3s ease-out infinite;
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.5s ease-in-out infinite;
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow:
              0 0 20px rgba(255, 215, 0, 0.5),
              0 0 40px rgba(255, 165, 0, 0.3);
          }
          50% {
            box-shadow:
              0 0 40px rgba(255, 215, 0, 0.8),
              0 0 80px rgba(255, 165, 0, 0.5);
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }

        @keyframes rainbow-text {
          0% {
            color: #ff6b6b;
            text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
          }
          25% {
            color: #ffd700;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          }
          50% {
            color: #4ecdc4;
            text-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
          }
          75% {
            color: #bb8fce;
            text-shadow: 0 0 20px rgba(187, 143, 206, 0.5);
          }
          100% {
            color: #ff6b6b;
            text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
          }
        }
        .animate-rainbow-text {
          animation: rainbow-text 3s linear infinite;
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.5;
          }
        }
        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes pulse-soft {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
