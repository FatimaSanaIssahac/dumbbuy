import { ProductPriceResult } from './types';
import { getCurrencyConfig, convertPrice } from './currencies';
import { extractPricesFromText, extractRepresentativePrice, RawProductCandidate } from './price-extractor';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Benchmark catalog of absurd & novelty items in USD for fallback / calibration
const NOVELTY_BENCHMARKS: Array<{ match: RegExp; title: string; priceUSD: number; source: string }> = [
  { match: /umbrella.*(?:bottle|drink|can|cup)/i, title: 'Miniature Decorative Bottle Umbrella Shield', priceUSD: 4.5, source: 'Amazon Specialty Beverage Accessories' },
  { match: /(?:inflatable|dancing|wacky).*(?:tube|man|guy|dancer)/i, title: '5-Inch Desktop Wacky Inflatable Flailing Tube Man', priceUSD: 14.99, source: 'Retail Novelty Desktop Toys' },
  { match: /rubber\s*duck/i, title: 'Yellow Squeaky Bath Rubber Duck (Pack/Unit)', priceUSD: 1.25, source: 'Toy Wholesalers & Retail' },
  { match: /(?:cardboard|cutout|standee).*(?:nicolas|cage|celebrity|actor)/i, title: 'Life-Sized Celebrity Cardboard Standee Cutout', priceUSD: 39.95, source: 'Celebrity Cutouts Direct' },
  { match: /cat.*(?:laser|helmet|hat)/i, title: 'Cat Laser Headband Interactive Toy', priceUSD: 12.5, source: 'Pet Novelty Gadgets' },
  { match: /banana\s*(?:suit|costume)/i, title: 'Adult Deluxe Yellow Banana Bodysuit', priceUSD: 24.99, source: 'Party City / Costume Retail' },
  { match: /cotton\s*candy\s*machine/i, title: 'Retro Electric Hard & Sugar Cotton Candy Maker', priceUSD: 42.0, source: 'Kitchen Appliance Retail' },
  { match: /t-?rex.*(?:costume|inflatable)/i, title: 'Adult Giant Inflatable T-Rex Dinosaur Costume', priceUSD: 48.5, source: 'Party & Costume Warehouse' },
  { match: /googly\s*eyes/i, title: '500-Piece Giant Self-Adhesive Googly Eyes Pack', priceUSD: 8.99, source: 'Craft & Art Supplies' },
  { match: /pillowcase|pillow.*cage/i, title: 'Sequin Revealing Novelty Face Throw Pillowcase', priceUSD: 11.5, source: 'Online Gift Index' },
  { match: /flamethrower/i, title: 'Not-A-Flamethrower Prop Toy / Torch', priceUSD: 299.0, source: 'Specialty Novelty Collectors' },
  { match: /bubble.*(?:blower|gun|machine)/i, title: 'Automatic 64-Hole Rocket Bubble Gun Blower', priceUSD: 19.99, source: 'Toys & Games Retail' },
  { match: /sword|katana/i, title: 'Decorative Stainless Steel Display Katana / Longsword', priceUSD: 45.0, source: 'Replica Weaponry & Decor' },
  { match: /suit\s*of\s*armor/i, title: 'Full-Sized Wearable Medieval Knight Suit of Armor', priceUSD: 1150.0, source: 'Historical Armor Artisans' },
  { match: /fidget\s*spinner/i, title: 'Rainbow Metallic EDC High-Speed Fidget Spinner', priceUSD: 5.99, source: 'Gadget Accessories' },
  { match: /whoopee\s*cushion/i, title: 'Self-Inflating Classic Rubber Whoopee Cushion', priceUSD: 3.5, source: 'Prank & Novelty Stores' },
];

export async function searchItemPrice(
  item: string,
  currencyCode: string = 'INR',
  userApiKey?: string
): Promise<ProductPriceResult> {
  const config = getCurrencyConfig(currencyCode);
  const cleanItem = item.trim().replace(/[^\w\s-]/g, '');
  
  const searchQuery = currencyCode === 'INR' 
    ? `${cleanItem} price India`
    : `${cleanItem} price ${config.code}`;

  const candidates: RawProductCandidate[] = [];

  // 1. Try Live AI Price Grounding (OpenAI or Gemini)
  const customKey = userApiKey?.trim();
  const apiKey = customKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    const isOpenAI = apiKey.startsWith('sk-') || Boolean(process.env.OPENAI_API_KEY && (!customKey || customKey.startsWith('sk-')));

    const prompt = `
You are a retail product pricing search intelligence engine.
Item: "${item}"
Currency: ${config.code} (${config.symbol})
Region: ${currencyCode === 'INR' ? 'India' : 'International'}

Find realistic, representative market prices for this item or the closest exact/similar retail product available online (e.g. Amazon, Flipkart, eBay, retail shops).
Provide 2 to 4 representative retail prices found across e-commerce.
Calculate the representative mid-range or median retail price for ONE unit.

Respond STRICTLY in JSON:
{
  "product_title": "string (name of exact or closest product)",
  "representative_price": number (positive numeric price in ${config.code}),
  "source": "string (e.g., 'Amazon India / Retail Shopping Results')",
  "is_exact_match": boolean,
  "found_prices": [number, number]
}
`;

    try {
      let text = '';
      if (isOpenAI) {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Item to price: "${item}" in ${config.code}` },
          ],
          response_format: { type: 'json_object' },
        });
        text = completion.choices[0]?.message?.content || '{}';
      } else {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelNames = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-flash-latest'];
        let lastErr: unknown;

        for (const mName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({
              model: mName,
              generationConfig: { responseMimeType: 'application/json' },
            });
            const result = await model.generateContent(prompt);
            text = result.response.text();
            if (text) break;
          } catch (e) {
            lastErr = e;
          }
        }

        if (!text && lastErr) {
          throw lastErr;
        }
      }

      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.representative_price === 'number' && parsed.representative_price > 0) {
        return {
          price: Math.max(1, Math.round(parsed.representative_price * 100) / 100),
          currency: config.code,
          currencySymbol: config.symbol,
          productTitle: parsed.product_title || item,
          source: parsed.source || `${currencyCode === 'INR' ? 'Amazon India' : 'Global'} Shopping Index`,
          isEstimated: !parsed.is_exact_match,
          searchQuery,
          allFoundPrices: Array.isArray(parsed.found_prices) ? parsed.found_prices : [parsed.representative_price],
        };
      }
    } catch (err) {
      console.warn('AI price search failed, continuing to web/catalog search:', err);
    }
  }

  // 2. Try DuckDuckGo Instant Web Search for live retail snippets
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(ddgUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const fullText = `${data.AbstractText || ''} ${data.Heading || ''} ${JSON.stringify(data.RelatedTopics || [])}`;
      const prices = extractPricesFromText(fullText, config.code);

      prices.forEach((p) => {
        candidates.push({
          title: data.Heading || cleanItem,
          price: p,
          source: 'DuckDuckGo Web Search & Shopping Snippets',
          isExact: false,
        });
      });
    }
  } catch {
    // Timeout fallback
  }

  // 3. Match against our curated novelty item benchmark database
  for (const bench of NOVELTY_BENCHMARKS) {
    if (bench.match.test(item)) {
      const priceInTargetCurrency = convertPrice(bench.priceUSD, config.code);
      candidates.push({
        title: bench.title,
        price: priceInTargetCurrency,
        source: bench.source,
        isExact: true,
      });
      break;
    }
  }

  // 4. If candidates exist, compute representative mid-range / median price
  if (candidates.length > 0) {
    return extractRepresentativePrice(candidates, config.code, searchQuery, 15, item);
  }

  // 5. Default estimation for novel/unlisted useless items
  const defaultUSD = 18.0;
  const estimatedPrice = convertPrice(defaultUSD, config.code);

  return {
    price: estimatedPrice,
    currency: config.code,
    currencySymbol: config.symbol,
    productTitle: cleanItem,
    source: 'Retail Market Estimate (Similar Novelty Products)',
    isEstimated: true,
    searchQuery,
    allFoundPrices: [estimatedPrice],
  };
}
