'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { WalletStats } from '@/types/finance';
import { NumericFormat } from 'react-number-format';

interface WalletCardsProps {
  wallets: WalletStats[];
}

export function WalletCards({ wallets }: WalletCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {wallets.map((wallet) => (
        <Card key={wallet.currency} className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <Wallet className="w-full h-full" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">
              {wallet.currency} Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              <NumericFormat
                value={wallet.balance}
                displayType="text"
                thousandSeparator=","
                prefix={wallet.currency === 'KRW' ? '₩' : '₫'}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-muted-foreground">Income</p>
                  <p className="font-medium text-emerald-500">
                    <NumericFormat
                      value={wallet.monthlyIncome}
                      displayType="text"
                      thousandSeparator=","
                      prefix={wallet.currency === 'KRW' ? '₩' : '₫'}
                    />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                <div>
                  <p className="text-muted-foreground">Expense</p>
                  <p className="font-medium text-rose-500">
                    <NumericFormat
                      value={wallet.monthlyExpense}
                      displayType="text"
                      thousandSeparator=","
                      prefix={wallet.currency === 'KRW' ? '₩' : '₫'}
                    />
                  </p>
                </div>
              </div>

              {(wallet.exchangeIn > 0 || wallet.exchangeOut > 0) && (
                <>
                  <div className="flex items-center gap-2 border-t border-border pt-2">
                    <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                      ↓
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Exch. In
                      </p>
                      <p className="font-medium text-foreground">
                        <NumericFormat
                          value={wallet.exchangeIn}
                          displayType="text"
                          thousandSeparator=","
                          prefix={wallet.currency === 'KRW' ? '₩' : '₫'}
                        />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-border pt-2">
                    <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                      ↑
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Exch. Out
                      </p>
                      <p className="font-medium text-foreground">
                        <NumericFormat
                          value={wallet.exchangeOut}
                          displayType="text"
                          thousandSeparator=","
                          prefix={wallet.currency === 'KRW' ? '₩' : '₫'}
                        />
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
