export interface JudgeRequest {
  balance: number;
  currency: string;
  item: string;
  reason: string;
  apiKey?: string;
}

export type UselessnessTier =
  | 'Extremely useful'
  | 'Mostly useful'
  | 'Questionable'
  | 'Pretty useless'
  | 'Extremely useless'
  | 'Spectacularly useless';

export interface AIJudgement {
  uselessness_score: number; // 0 to 100
  is_useful: boolean;
  verdict: string;
  reasoning: string;
  tier: UselessnessTier;
  funny_one_liner?: string;
}

export interface ProductPriceResult {
  price: number;
  currency: string;
  currencySymbol: string;
  productTitle: string;
  source: string;
  isEstimated: boolean;
  searchQuery: string;
  allFoundPrices?: number[];
}

export interface AffordabilityResult {
  bankBalance: number;
  itemPrice: number;
  quantity: number;
  remainingBalance: number;
  deficit: number;
  currency: string;
  currencySymbol: string;
  headline: string;
  subtext: string;
  isSingleItem: boolean;
  isUnaffordable: boolean;
}

export interface JudgeResponse {
  outcome: 'TOO_USEFUL' | 'USELESS_ENOUGH';
  judgement: AIJudgement;
  pricing?: ProductPriceResult;
  affordability?: AffordabilityResult;
  quotes: string[];
  item: string;
  reason: string;
  currency: string;
  currencySymbol: string;
  isMock?: boolean;
}

export interface PresetItem {
  balance: number;
  currency: string;
  item: string;
  reason: string;
  badge: string;
  category: 'useful' | 'useless';
}
