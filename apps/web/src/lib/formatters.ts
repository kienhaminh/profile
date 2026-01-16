export const formatCurrency = (
  value: number,
  currency: string | null = 'USD'
): string => {
  const currencyCode = currency || 'USD';

  // Map common currency codes to locales if needed, or rely on Intl defaults
  const localeMap: Record<string, string> = {
    VND: 'vi-VN',
    KRW: 'ko-KR',
    USD: 'en-US',
    EUR: 'de-DE', // Example
  };

  const locale = localeMap[currencyCode] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};
