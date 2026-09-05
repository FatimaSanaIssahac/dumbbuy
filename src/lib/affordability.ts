import { AffordabilityResult } from './types';
import { formatCurrency, getCurrencyConfig } from './currencies';

export function calculateAffordability(
  bankBalance: number,
  itemPrice: number,
  currencyCode: string = 'INR'
): AffordabilityResult {
  const config = getCurrencyConfig(currencyCode);
  const safeBalance = Math.max(0, Number(bankBalance) || 0);
  const safePrice = Math.max(0.01, Number(itemPrice) || 1);

  const quantity = Math.floor(safeBalance / safePrice);
  const totalCost = quantity * safePrice;
  const remainingBalance = Math.max(0, Math.round((safeBalance - totalCost) * 100) / 100);
  const deficit = quantity === 0 ? Math.max(0, Math.round((safePrice - safeBalance) * 100) / 100) : 0;

  const isUnaffordable = quantity === 0;
  const isSingleItem = quantity === 1;

  let headline: string;
  let subtext: string;

  if (isUnaffordable) {
    headline = "YOU CAN'T EVEN AFFORD ONE.";
    subtext = `You need ${formatCurrency(deficit, currencyCode)} more to make this terrible financial mistake.`;
  } else if (isSingleItem) {
    headline = 'YOU CAN ONLY AFFORD ONE.';
    subtext = 'One was already far too many, but your bank account allows it.';
  } else {
    headline = `YOU CAN BUY ${quantity.toLocaleString()} OF THESE.`;
    subtext = 'of these completely unnecessary things';
  }

  return {
    bankBalance: safeBalance,
    itemPrice: safePrice,
    quantity,
    remainingBalance,
    deficit,
    currency: config.code,
    currencySymbol: config.symbol,
    headline,
    subtext,
    isSingleItem,
    isUnaffordable,
  };
}
