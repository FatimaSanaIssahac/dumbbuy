import { NextRequest, NextResponse } from 'next/server';
import { searchItemPrice } from '@/lib/price-search';
import { calculateAffordability } from '@/lib/affordability';
import { generateDynamicQuotes } from '@/lib/verdicts';
import { getCurrencyConfig } from '@/lib/currencies';

export async function POST(req: NextRequest) {
  try {
    const { item, currency = 'INR', balance = 10000, apiKey } = await req.json();

    if (!item || !item.trim()) {
      return NextResponse.json({ error: 'Item name required' }, { status: 400 });
    }

    const config = getCurrencyConfig(currency);
    const pricing = await searchItemPrice(item.trim(), config.code, apiKey);
    const affordability = calculateAffordability(Number(balance), pricing.price, config.code);
    const quotes = generateDynamicQuotes(item.trim(), affordability.quantity, Number(balance), pricing.price, config.code);

    return NextResponse.json({ pricing, affordability, quotes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to search price';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
