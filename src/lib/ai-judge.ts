import { AIJudgement, UselessnessTier } from './types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export const USELESSNESS_THRESHOLD = 70;

export function getTierFromScore(score: number): UselessnessTier {
  if (score <= 20) return 'Extremely useful';
  if (score <= 40) return 'Mostly useful';
  if (score <= 60) return 'Questionable';
  if (score <= 80) return 'Pretty useless';
  if (score <= 95) return 'Extremely useless';
  return 'Spectacularly useless';
}

// Built-in semantic dictionaries for offline heuristic judgement
const ESSENTIAL_OBJECTS = [
  'laptop', 'computer', 'phone', 'smartphone', 'textbook', 'book', 'course', 'tuition',
  'medicine', 'medication', 'insulin', 'inhaler', 'glasses', 'wheelchair', 'crutches',
  'rent', 'mortgage', 'utility', 'electricity', 'water bill', 'gas bill', 'internet',
  'groceries', 'rice', 'dal', 'vegetables', 'fruit', 'milk', 'bread', 'eggs', 'food',
  'tire', 'tires', 'brake', 'car repair', 'oil change', 'engine', 'helmet', 'seatbelt',
  'winter coat', 'jacket', 'boots', 'shoes', 'socks', 'underwear', 'blanket', 'heater',
  'diaper', 'diapers', 'baby formula', 'baby food', 'crib', 'stroller',
  'fire extinguisher', 'smoke detector', 'first aid', 'bandage', 'insurance'
];

const ESSENTIAL_REASONS = [
  'university', 'school', 'college', 'degree', 'work', 'job', 'employment', 'career',
  'survive', 'survival', 'starve', 'starvation', 'health', 'healthy', 'illness', 'doctor',
  'hospital', 'prescription', 'pain', 'emergency', 'safe', 'safety', 'eviction', 'evicted',
  'warmth', 'cold', 'freeze', 'essential', 'necessary', 'mandatory', 'legal', 'taxes'
];

const ABSURD_NOVELTY_OBJECTS = [
  'umbrella for', 'inflatable', 'tube man', 'rubber duck', 'rubber ducks', 'cardboard cutout',
  'nicolas cage', 'shrek', 'costume', 'suit of armor', 'laser pointer', 'laser helmet',
  'banana suit', 'cotton candy machine', 'disco ball', 'fog machine', 'whoopee cushion',
  'flamethrower', 'marshmallow gun', 'fidget spinner', 'googly eyes', 'toilet paper',
  'bubble gun', 'bubble blower', 'hovercraft', 'cat treadmill', 'gold foil', 'pet rock'
];

const ABSURD_REASONS = [
  'might get wet', 'cheer up', 'plants', 'roommate', 'neighbor', 'swimming pool', 'prank',
  'assert dominance', 'bored', 'funny', 'tiktok', 'instagram', 'impress', 'zombie',
  'alien', 'apocalypse', 'fun', 'chaos', 'pointless', 'useless', 'confuse', 'secret agent',
  'prehistoric', 'dinosaur', 'cult', 'aesthetic', 'vibe'
];

export function evaluateOfflineHeuristics(item: string, reason: string): AIJudgement {
  const itemLower = item.toLowerCase();
  const reasonLower = reason.toLowerCase();

  let usefulMatches = 0;
  let absurdMatches = 0;

  ESSENTIAL_OBJECTS.forEach((word) => {
    if (itemLower.includes(word)) usefulMatches += 2;
  });

  ESSENTIAL_REASONS.forEach((word) => {
    if (reasonLower.includes(word)) usefulMatches += 2;
  });

  ABSURD_NOVELTY_OBJECTS.forEach((word) => {
    if (itemLower.includes(word)) absurdMatches += 3;
  });

  ABSURD_REASONS.forEach((word) => {
    if (reasonLower.includes(word)) absurdMatches += 3;
  });

  let score: number;
  let isUseful: boolean;
  let verdict: string;
  let reasoning: string;

  if (usefulMatches >= 3 && absurdMatches <= 1) {
    score = Math.max(5, Math.min(25, 20 - usefulMatches * 3));
    isUseful = true;
    verdict = 'Offensively practical and sensible.';
    reasoning = `This is a genuine necessity that solves a real-world problem. Buying "${item}" for "${reason}" has zero comedic or financial chaos value.`;
  } else if (usefulMatches > absurdMatches) {
    score = 35;
    isUseful = true;
    verdict = 'Far too sensible for this website.';
    reasoning = `While your presentation might sound quirky, "${item}" genuinely addresses a practical necessity. We cannot in good conscience approve this responsible behavior.`;
  } else if (absurdMatches >= 2) {
    score = Math.min(99, 82 + Math.min(15, absurdMatches * 4));
    isUseful = false;
    verdict = score >= 95 ? 'Spectacularly useless.' : 'Extremely useless.';
    reasoning = `Purchasing "${item}" because "${reason}" solves a problem that does not exist on this or any neighboring planet. A triumph of financial irresponsibility.`;
  } else {
    const isReasonRidiculous = reasonLower.length < 15 || reasonLower.includes('because') || reasonLower.includes('want');
    if (isReasonRidiculous) {
      score = 86;
      isUseful = false;
      verdict = 'Spectacularly unnecessary.';
      reasoning = `"${item}" has countless practical alternatives or simply serves no productive economic function, especially given your justification.`;
    } else {
      score = 78;
      isUseful = false;
      verdict = 'Pretty useless.';
      reasoning = `The economic utility of "${item}" is approaching absolute zero. Approved for maximum chaos.`;
    }
  }

  const tier = getTierFromScore(score);

  return {
    uselessness_score: score,
    is_useful: isUseful,
    verdict,
    reasoning,
    tier,
  };
}

export async function judgePurchase(
  item: string,
  reason: string,
  userApiKey?: string
): Promise<AIJudgement> {
  const customKey = userApiKey?.trim();
  const apiKey = customKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return evaluateOfflineHeuristics(item, reason);
  }

  const isOpenAI = apiKey.startsWith('sk-') || Boolean(process.env.OPENAI_API_KEY && (!customKey || customKey.startsWith('sk-')));

  const prompt = `
You are the AI judge of the satirical website "Can I Afford This?".
The entire purpose of the website is to determine whether someone has enough money to buy an unnecessarily useless thing.

Item: "${item}"
Stated Reason: "${reason}"

Your task:
Judge how useless this purchase is by considering:
1. How unnecessary the object is.
2. How unnecessary the stated reason is.
3. Whether the object already has an obvious practical alternative.
4. Whether the purchase solves a real problem.
5. How absurd the reasoning is.
6. Whether the purchase is genuinely useful despite sounding ridiculous.

CRITICAL INSTRUCTION:
Do NOT simply assume that something is useless because it sounds unusual. A genuinely useful purchase (like a laptop for university coursework, healthcare, rent, safety gear) MUST be recognized as useful with is_useful = true and uselessness_score < 40.

Provide a uselessness_score from 0 to 100:
- 0–20: Extremely useful
- 21–40: Mostly useful
- 41–60: Questionable
- 61–80: Pretty useless
- 81–95: Extremely useless
- 96–100: Spectacularly useless

Threshold rule:
- If uselessness_score >= 70, set is_useful = false (Useless enough to celebrate).
- If uselessness_score < 70, set is_useful = true (Too useful, rejected for being sensible).

Respond STRICTLY in this JSON format:
{
  "uselessness_score": number,
  "is_useful": boolean,
  "verdict": "string (short punchy verdict)",
  "reasoning": "string (short, funny explanation of your judgement)"
}
`;

  try {
    let responseText = '';

    if (isOpenAI) {
      // Use OpenAI gpt-4o-mini
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Please evaluate this purchase:\nItem: "${item}"\nReason: "${reason}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      responseText = completion.choices[0]?.message?.content || '{}';
    } else {
      // Use Google Gemini 3.5 Flash Lite (with fallback)
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
          responseText = result.response.text();
          if (responseText) break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!responseText && lastErr) {
        throw lastErr;
      }
    }

    const parsed = JSON.parse(responseText);

    if (typeof parsed.uselessness_score !== 'number' || isNaN(parsed.uselessness_score)) {
      throw new Error('Invalid uselessness_score in AI output');
    }

    const rawScore = Math.max(0, Math.min(100, Math.round(parsed.uselessness_score)));
    const isUseful = rawScore < USELESSNESS_THRESHOLD || Boolean(parsed.is_useful && rawScore < 70);
    const tier = getTierFromScore(rawScore);

    return {
      uselessness_score: rawScore,
      is_useful: isUseful,
      verdict: parsed.verdict || (isUseful ? 'Far too sensible.' : 'Spectacularly unnecessary.'),
      reasoning: parsed.reasoning || `Judged with a uselessness score of ${rawScore}/100.`,
      tier,
    };
  } catch (err) {
    console.warn('Live AI API judgement failed or threw error, falling back to heuristics:', err);
    return evaluateOfflineHeuristics(item, reason);
  }
}
