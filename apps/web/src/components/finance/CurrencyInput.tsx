'use client';

import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Input } from '@/components/ui/input';
import { Currency } from '@/types/finance';

interface CurrencyInputProps extends Omit<NumericFormatProps, 'customInput'> {
  currency: Currency;
}

export function CurrencyInput({ currency, ...props }: CurrencyInputProps) {
  const prefix = currency === 'KRW' ? '₩' : currency === 'VND' ? '₫' : '$';

  return (
    <NumericFormat
      {...props}
      prefix={prefix}
      thousandSeparator=","
      valueIsNumericString
      customInput={Input}
    />
  );
}
