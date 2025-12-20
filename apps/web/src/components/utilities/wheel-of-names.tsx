'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, RotateCcw, Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface WheelOfNamesProps {
  className?: string;
}

// Default colors for wheel segments
const WHEEL_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8B500',
  '#00CED1',
];

export function WheelOfNames({ className }: WheelOfNamesProps) {
  const [names, setNames] = useState<string[]>(['Alice', 'Bob', 'Charlie']);
  const [newName, setNewName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const addName = () => {
    if (newName.trim() && !names.includes(newName.trim())) {
      setNames([...names, newName.trim()]);
      setNewName('');
    } else if (names.includes(newName.trim())) {
      toast.error('Name already exists!');
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const spin = () => {
    if (names.length < 2) {
      toast.error('Please add at least 2 names');
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    // Random number of full rotations (3-5) plus random segment
    const fullRotations = 3 + Math.random() * 2;
    const segmentAngle = 360 / names.length;
    const randomSegment = Math.floor(Math.random() * names.length);
    const extraAngle = randomSegment * segmentAngle + segmentAngle / 2;
    const newRotation = rotation + fullRotations * 360 + extraAngle;

    setRotation(newRotation);

    // Calculate winner after spin completes
    setTimeout(() => {
      // The pointer is at the top, so we need to calculate which segment is there
      const normalizedRotation = newRotation % 360;
      const winnerIndex =
        Math.floor(
          (360 - normalizedRotation + segmentAngle / 2) / segmentAngle
        ) % names.length;
      setWinner(names[winnerIndex]);
      setIsSpinning(false);
      toast.success(`🎉 Winner: ${names[winnerIndex]}!`);
    }, 4000);
  };

  const reset = () => {
    setNames(['Alice', 'Bob', 'Charlie']);
    setRotation(0);
    setWinner(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addName();
    }
  };

  // Generate wheel segments
  const segmentAngle = 360 / names.length;
  const radius = 140;
  const centerX = 150;
  const centerY = 150;

  const getSegmentPath = (index: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const angle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    return {
      x: centerX + textRadius * Math.cos(angle),
      y: centerY + textRadius * Math.sin(angle),
      rotation: (index + 0.5) * segmentAngle,
    };
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className || ''}`}>
      {/* Wheel */}
      <Card className="flex flex-col items-center justify-center p-6">
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <svg
            ref={wheelRef}
            width="300"
            height="300"
            className="drop-shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                : 'none',
            }}
          >
            {names.map((name, index) => {
              const textPos = getTextPosition(index);
              return (
                <g key={index}>
                  <path
                    d={getSegmentPath(index)}
                    fill={WHEEL_COLORS[index % WHEEL_COLORS.length]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="#fff"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    className="drop-shadow-sm pointer-events-none"
                  >
                    {name.length > 10 ? name.substring(0, 10) + '...' : name}
                  </text>
                </g>
              );
            })}
            <circle
              cx={centerX}
              cy={centerY}
              r="20"
              fill="#333"
              stroke="#fff"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Winner Display */}
        {winner && (
          <div className="mt-6 text-center animate-bounce">
            <p className="text-2xl font-bold text-primary">🎉 {winner} 🎉</p>
          </div>
        )}

        {/* Spin Button */}
        <Button
          onClick={spin}
          disabled={isSpinning || names.length < 2}
          size="lg"
          className="mt-6 gap-2"
        >
          <Shuffle className="w-5 h-5" />
          {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
        </Button>
      </Card>

      {/* Names List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Names ({names.length})
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Name Input */}
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a name..."
              className="flex-1"
            />
            <Button onClick={addName} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Names List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {names.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        WHEEL_COLORS[index % WHEEL_COLORS.length],
                    }}
                  />
                  <span>{name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeName(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
