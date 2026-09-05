const express = require('express');
const router = express.Router();
const { analyzePurchase } = require('../services/aiService');

router.post('/', async (req, res) => {
  try {
    const { item, reason, sadhyaMode, malayaliMode } = req.body;
    
    if (!item || !reason) {
      return res.status(400).json({ error: 'Item and reason are required' });
    }

    const result = await analyzePurchase(item, reason, sadhyaMode, malayaliMode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
