const { GoogleGenAI } = require('@google/genai');

async function analyzePurchase(item, reason, sadhyaMode = false, malayaliMode = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log("No API Key provided, returning mocked response for demo.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          item: item,
          reason: reason,
          usefulness_score: 5,
          uselessness_score: sadhyaMode ? 99 : 92,
          is_useless_enough: true,
          reasoning: sadhyaMode ? "Existential metrics indicate this purchase transcends physical utility. The universe demands its existence." : "You already have things that do this. This is entirely unnecessary and a beautiful waste of resources.",
          verdict: "APPROVED",
          roast: malayaliMode ? `Ithu vangaan aano salary okke? A perfectly useless purchase.` : `Humanity has officially peaked with this ${item}.`
        });
      }, 2000);
    });
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const model = 'gemini-2.5-flash';
  
  let modePrompt = '';
  if (malayaliMode) {
    modePrompt += '\nMalayali Mode is ENABLED. You must occasionally use natural Malayalam/Manglish expressions in your reasoning and roast. Keep it playful and culturally relevant to Kerala.\n';
  }
  if (sadhyaMode) {
    modePrompt += '\nSadhya Mode is ENABLED. Make the analysis dramatically more absurd. Refer to "Sadhya Compatibility" and evaluate the purchase based on completely fake metrics like "Existential Necessity". The reasoning should be over-the-top and philosophical about uselessness.\n';
  }

  const prompt = `
You are the Uselessness Evaluation Authority.
Your job is NOT to determine whether a purchase is financially sensible.
Your only job is to determine how unnecessarily unnecessary the purchase is.

Evaluate both:
1. The object being purchased.
2. The user's reason for purchasing it.

A purchase should receive a high uselessness score when:
* it solves a problem nobody has
* a normal inexpensive object already performs the same function
* the product exists primarily for novelty
* the justification is absurd
* the user could easily live without it
* the purchase has excessive complexity for a trivial problem

A purchase should receive a low uselessness score when:
* it provides genuine practical value
* it solves a real problem
* it is necessary for safety
* it is needed for work, education, health, transportation, food, housing, etc.

If the purchase is genuinely useful, it MUST receive a low uselessness score (e.g. < 50).
Set a threshold of uselessness_score >= 70 for 'APPROVED'. If below 70, verdict should be 'REJECTED'.

USER PURCHASE:
Item: "${item}"
Reason: "${reason}"
${modePrompt}

You must return ONLY a JSON object with the following schema, and no other text:
{
  "item": "string",
  "reason": "string",
  "usefulness_score": number (0-100),
  "uselessness_score": number (0-100),
  "is_useless_enough": boolean,
  "reasoning": "string",
  "verdict": "APPROVED" or "REJECTED",
  "roast": "string"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const resultJson = JSON.parse(resultText);
    return resultJson;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error('Our Uselessness Evaluation Department is currently reconsidering its life choices.');
  }
}

module.exports = {
  analyzePurchase
};
