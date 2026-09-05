export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  rateFromUSD: number; // For international price translation
  countrySearchSuffix: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    rateFromUSD: 85.0,
    countrySearchSuffix: 'price India Amazon Flipkart',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    rateFromUSD: 1.0,
    countrySearchSuffix: 'price USD online store',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    rateFromUSD: 0.92,
    countrySearchSuffix: 'price EUR shopping',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    rateFromUSD: 0.79,
    countrySearchSuffix: 'price UK store',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    rateFromUSD: 1.38,
    countrySearchSuffix: 'price Canada shopping',
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    rateFromUSD: 1.54,
    countrySearchSuffix: 'price Australia shopping',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    rateFromUSD: 155.0,
    countrySearchSuffix: 'price Japan online',
  },
};

export const DEFAULT_CURRENCY = 'INR';

export function getCurrencyConfig(currencyCode?: string): CurrencyConfig {
  const norm = (currencyCode || DEFAULT_CURRENCY).toUpperCase();
  return SUPPORTED_CURRENCIES[norm] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY, includeSymbol: boolean = true): string {
  const config = getCurrencyConfig(currencyCode);
  const isWhole = Number.isInteger(amount) || config.code === 'JPY' || config.code === 'INR';
  
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(amount);

  return includeSymbol ? `${config.symbol}${formattedNumber}` : formattedNumber;
}

export function convertPrice(amountInUSD: number, targetCurrency: string): number {
  const config = getCurrencyConfig(targetCurrency);
  const raw = amountInUSD * config.rateFromUSD;
  // Round sensibly for human reading
  if (config.code === 'INR' || config.code === 'JPY') {
    return Math.max(1, Math.round(raw));
  }
  return Math.max(0.5, Math.round(raw * 100) / 100);
}
