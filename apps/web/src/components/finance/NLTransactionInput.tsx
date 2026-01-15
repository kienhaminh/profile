'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Loader2, Sparkles, Check, X, ChevronDown } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import {
  processTransactionInput,
  confirmTransaction,
  type ParsedTransaction,
} from '@/agents/transactionAgent';

const PLACEHOLDER_EXAMPLES = [
  'Lunch today 15000 KRW food must have',
  'Received salary 3000000 KRW',
  'Coffee yesterday 4500원 waste',
  'Bus fare 1500 KRW transport must have',
];

export function NLTransactionInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [preview, setPreview] = useState<ParsedTransaction | null>(null);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_EXAMPLES[0]);
  const router = useRouter();

  // Set random placeholder only on client to avoid hydration mismatch
  useEffect(() => {
    setPlaceholder(
      PLACEHOLDER_EXAMPLES[
        Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)
      ]
    );
  }, []);

  const handleProcess = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setPreview(null);

    try {
      const result = await processTransactionInput(input);
      if (result.success && result.data) {
        setPreview(result.data);
      } else {
        toast.error(result.error || 'Failed to parse input');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    setIsConfirming(true);
    try {
      const result = await confirmTransaction(preview);
      if (result.success) {
        toast.success('Transaction created successfully!');
        setInput('');
        setPreview(null);
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create transaction');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Input
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-6 mt-2 z-50">
        <Card className="w-[400px] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Natural Language Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={`e.g., "${placeholder}"`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isProcessing) {
                    handleProcess();
                  }
                }}
                disabled={isProcessing || isConfirming}
              />
              <Button
                onClick={handleProcess}
                disabled={!input.trim() || isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Parse'
                )}
              </Button>
            </div>

            {preview && (
              <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preview</span>
                  <Badge
                    variant={
                      preview.type === 'income' ? 'default' : 'secondary'
                    }
                  >
                    {preview.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span
                      className={`ml-2 font-medium ${
                        preview.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      <NumericFormat
                        value={preview.amount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={preview.currency === 'KRW' ? '₩' : '₫'}
                      />
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2">{preview.date}</span>
                  </div>
                  {preview.categoryName && (
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2">{preview.categoryName}</span>
                    </div>
                  )}
                  {preview.priority && (
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="ml-2 capitalize">
                        {preview.priority.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  {preview.description && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">
                        Description:
                      </span>
                      <span className="ml-2">{preview.description}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isConfirming}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
