import { NextRequest, NextResponse } from 'next/server';
import { JudgeRequest, JudgeResponse } from '@/lib/types';
import { judgePurchase } from '@/lib/ai-judge';
import { searchItemPrice } from '@/lib/price-search';
import { calculateAffordability } from '@/lib/affordability';
import { generateDynamicQuotes } from '@/lib/verdicts';
import { getCurrencyConfig } from '@/lib/currencies';

export async function POST(req: NextRequest) {
  try {
    const body: JudgeRequest = await req.json();
    const { balance, currency = 'INR', item, reason, apiKey } = body;

    // 1. Validate inputs
    if (balance === undefined || balance === null || isNaN(Number(balance))) {
      return NextResponse.json(
        { error: 'Please enter a valid numeric bank balance.' },
        { status: 400 }
      );
    }

    const numBalance = Number(balance);
    if (numBalance <= 0) {
      return NextResponse.json(
        { error: 'Bank balance must be greater than zero. Even terrible decisions require some funds.' },
        { status: 400 }
      );
    }

    if (!item || item.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please specify the completely unnecessary thing you want to buy.' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide the reason / justification for this purchase.' },
        { status: 400 }
      );
    }

    const cleanItem = item.trim();
    const cleanReason = reason.trim();
    const currencyConfig = getCurrencyConfig(currency);

    // 2. Perform AI Judgement
    const judgement = await judgePurchase(cleanItem, cleanReason, apiKey);

    // 3. OUTCOME 1: TOO USEFUL (Score < 70 or is_useful is true)
    if (judgement.is_useful) {
      const response: JudgeResponse = {
        outcome: 'TOO_USEFUL',
        judgement,
        quotes: [
          'Sorry. This purchase has been rejected for being far too sensible.',
          'Pragmatism detected. Our anti-financial advisors are deeply disappointed.',
          'Your financial maturity is ruining the vibe.',
          'Please return when you have a genuinely destructive financial plan.',
        ],
        item: cleanItem,
        reason: cleanReason,
        currency: currencyConfig.code,
        currencySymbol: currencyConfig.symbol,
      };

      return NextResponse.json(response);
    }

    // 4. OUTCOME 2: USELESS ENOUGH (Score >= 70)
    // Run web price discovery
    const pricing = await searchItemPrice(cleanItem, currencyConfig.code, apiKey);

    // Calculate affordability
    const affordability = calculateAffordability(numBalance, pricing.price, currencyConfig.code);

    // Generate dynamic quotes
    const quotes = generateDynamicQuotes(
      cleanItem,
      affordability.quantity,
      numBalance,
      pricing.price,
      currencyConfig.code
    );

    const response: JudgeResponse = {
      outcome: 'USELESS_ENOUGH',
      judgement,
      pricing,
      affordability,
      quotes,
      item: cleanItem,
      reason: cleanReason,
      currency: currencyConfig.code,
      currencySymbol: currencyConfig.symbol,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('API /api/judge error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
