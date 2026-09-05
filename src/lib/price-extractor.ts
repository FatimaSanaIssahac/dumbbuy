import { ProductPriceResult } from './types';
import { getCurrencyConfig, convertPrice } from './currencies';

export interface RawProductCandidate {
  title: string;
  price: number;
  source: string;
  isExact: boolean;
}

export function extractRepresentativePrice(
  candidates: RawProductCandidate[],
  currencyCode: string,
  searchQuery: string,
  fallbackEstimatedUSD: number = 15,
  defaultItemTitle?: string
): ProductPriceResult {
  const config = getCurrencyConfig(currencyCode);

  // Filter realistic positive candidate prices
  const validCandidates = candidates.filter(
    (c) => typeof c.price === 'number' && !isNaN(c.price) && c.price > 0 && isFinite(c.price)
  );

  if (validCandidates.length === 0) {
    // Graceful estimation fallback
    const estimatedInCurrency = convertPrice(fallbackEstimatedUSD, currencyCode);
    return {
      price: estimatedInCurrency,
      currency: config.code,
      currencySymbol: config.symbol,
      productTitle: defaultItemTitle || searchQuery,
      source: 'Retail Market Estimate (Similar Products)',
      isEstimated: true,
      searchQuery,
      allFoundPrices: [estimatedInCurrency],
    };
  }

  // Sort prices ascending
  const sorted = [...validCandidates].sort((a, b) => a.price - b.price);
  const prices = sorted.map((c) => c.price);

  // Calculate median / representative mid-range price
  const midIndex = Math.floor(prices.length / 2);
  let representativeCandidate: RawProductCandidate;

  if (prices.length % 2 === 0 && prices.length >= 2) {
    // Mid-range candidate
    representativeCandidate = sorted[midIndex];
  } else {
    representativeCandidate = sorted[midIndex];
  }

  // Check if any candidate was marked exact
  const hasExact = validCandidates.some((c) => c.isExact);

  return {
    price: representativeCandidate.price,
    currency: config.code,
    currencySymbol: config.symbol,
    productTitle: representativeCandidate.title || defaultItemTitle || searchQuery,
    source: representativeCandidate.source || 'Online Retail Index',
    isEstimated: !hasExact,
    searchQuery,
    allFoundPrices: prices,
  };
}

/**
 * Extracts numbers with currency symbols from text snippets
 */
export function extractPricesFromText(text: string, currencyCode: string): number[] {
  const prices: number[] = [];
  
  // Patterns for ₹ / Rs / INR / $ / £ / €
  const inrPatterns = [
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rupees|inr|rs)/gi,
  ];

  const dollarPatterns = [
    /(?:\$|usd)\s*([\d,]+(?:\.\d{1,2})?)/gi,
  ];

  const patterns = currencyCode === 'INR' ? inrPatterns : dollarPatterns;

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0 && num < 10000000) {
        prices.push(num);
      }
    }
  }

  return prices;
}
