const axios = require('axios');

async function estimatePrice(item) {
  // If we have a SerpAPI key, we could use it here.
  // For the sake of the hackathon demo, if no key is provided, we simulate a search failure
  // OR we can simulate finding a price. The prompt asks to allow manual entry if it fails.
  
  const searchApiKey = process.env.SEARCH_API_KEY;

  if (searchApiKey) {
    try {
      // Example using SerpApi (Google Search)
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: `${item} price in India`,
          api_key: searchApiKey,
          gl: 'in',
          hl: 'en'
        }
      });
      
      // Attempt to extract a price from the answer box or shopping results
      const answerBox = response.data.answer_box;
      const shopping = response.data.shopping_results;
      
      let estimatedPrice = null;
      if (answerBox && answerBox.price) {
        estimatedPrice = parseFloat(answerBox.price.replace(/[^0-9.]/g, ''));
      } else if (shopping && shopping.length > 0) {
        // Take median of top 3
        const prices = shopping.slice(0, 3).map(i => parseFloat(i.extracted_price || i.price.replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p));
        if (prices.length > 0) {
          estimatedPrice = prices.sort((a,b) => a-b)[Math.floor(prices.length/2)];
        }
      }

      if (estimatedPrice) {
        return {
          estimated_price: estimatedPrice,
          currency: "INR",
          source: "Search Results",
          confidence: "medium"
        };
      }
    } catch (error) {
      console.error("Search API failed", error);
    }
  }

  // Fallback: throw error to trigger manual price entry on frontend
  throw new Error("Could not find a reliable price.");
}

module.exports = { estimatePrice };
