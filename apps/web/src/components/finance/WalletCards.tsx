'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { WalletStats, ProjectedCashflow } from '@/types/finance';
import { NumericFormat } from 'react-number-format';

interface WalletCardsProps {
  wallets: WalletStats[];
  projected?: ProjectedCashflow[];
  noCard?: boolean;
}

export function WalletCards({ wallets, projected, noCard }: WalletCardsProps) {
  const getProjectedForWallet = (currency: string) => {
    return projected?.find((p) => p.currency === currency);
  };

  if (wallets.length === 0) return null;

  const wallet = wallets[0]; // Since we're filtering to 1 wallet now
  const proj = getProjectedForWallet(wallet.currency);
  const currencyPrefix = wallet.currency === 'KRW' ? '₩' : '₫';
  const hasExchange = wallet.exchangeIn > 0 || wallet.exchangeOut > 0;

  const netMonth =
    wallet.monthlyIncome - wallet.monthlyExpense - wallet.exchangeOut;
  const isPositive = netMonth >= 0;
  const savingsRate =
    wallet.monthlyIncome > 0 ? (netMonth / wallet.monthlyIncome) * 100 : 0;

  const content = (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. Primary Balance Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded-md bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
              {wallet.currency} Balance
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            <NumericFormat
              value={wallet.balance}
              displayType="text"
              thousandSeparator=","
              prefix={currencyPrefix}
            />
          </div>
        </div>

        {proj && proj.pendingRecurring > 0 && (
          <div className="text-right bg-primary/5 p-2 rounded-xl border border-primary/10">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Safe to Spend
            </span>
            <div className="text-lg font-bold text-primary leading-none my-1">
              <NumericFormat
                value={proj.projectedBalance}
                displayType="text"
                thousandSeparator=","
                prefix={currencyPrefix}
              />
            </div>
            <span className="text-[10px] text-rose-500 font-medium">
              -{proj.pendingRecurring.toLocaleString()} upcoming
            </span>
          </div>
        )}
      </div>

      {/* 2. Monthly Performance (The Fill Section) */}
      <div className="flex-1 bg-muted/30 rounded-2xl p-4 border border-border/50 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Monthly Performance
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              Net Flow
            </div>
            <div
              className={`text-2xl font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              <NumericFormat
                value={Math.abs(netMonth)}
                displayType="text"
                thousandSeparator=","
                prefix={
                  isPositive ? '+' + currencyPrefix : '-' + currencyPrefix
                }
                allowNegative={false}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              Savings Rate
            </div>
            <div
              className={`text-xl font-bold ${savingsRate > 20 ? 'text-emerald-500' : 'text-amber-500'}`}
            >
              {savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Progress bar for savings rate if positive */}
        {wallet.monthlyIncome > 0 && (
          <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* 3. Core Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">
              Income
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-500">
            <NumericFormat
              value={wallet.monthlyIncome}
              displayType="text"
              thousandSeparator=","
              prefix={currencyPrefix}
            />
          </div>
        </div>

        <div className="bg-rose-500/10 rounded-xl p-2.5 border border-rose-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownCircle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[10px] text-rose-500/80 font-bold uppercase tracking-wider">
              Expense
            </span>
          </div>
          <div className="text-sm font-bold text-rose-500">
            <NumericFormat
              value={wallet.monthlyExpense}
              displayType="text"
              thousandSeparator=","
              prefix={currencyPrefix}
            />
          </div>
        </div>

        {hasExchange && (
          <>
            <div className="bg-violet-500/10 rounded-xl p-2.5 border border-violet-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowRightLeft className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-[10px] text-violet-500/80 font-bold uppercase tracking-wider">
                  In
                </span>
              </div>
              <div className="text-sm font-bold text-violet-500">
                <NumericFormat
                  value={wallet.exchangeIn}
                  displayType="text"
                  thousandSeparator=","
                  prefix={currencyPrefix}
                />
              </div>
            </div>

            <div className="bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
                  Out
                </span>
              </div>
              <div className="text-sm font-bold text-amber-500">
                <NumericFormat
                  value={wallet.exchangeOut}
                  displayType="text"
                  thousandSeparator=","
                  prefix={currencyPrefix}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (noCard) return content;

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">{content}</CardContent>
    </Card>
  );
}
