'use client';

import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Input } from '@/components/ui/input';
import { Currency } from '@/types/finance';

interface CurrencyInputProps extends Omit<NumericFormatProps, 'customInput'> {
  currency: Currency;
}

export function CurrencyInput({
  currency,
  value,
  onValueChange,
  ...props
}: CurrencyInputProps) {
  const prefix = currency === 'KRW' ? '₩' : currency === 'VND' ? '₫' : '$';

  return (
    <NumericFormat
      {...props}
      value={value !== undefined && value !== null ? String(value) : ''}
      onValueChange={(values, sourceInfo) => {
        if (onValueChange) {
          onValueChange(values, sourceInfo);
        }
      }}
      prefix={prefix}
      thousandSeparator=","
      valueIsNumericString
      customInput={Input}
    />
  );
}
