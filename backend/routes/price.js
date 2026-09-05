const express = require('express');
const router = express.Router();
const { estimatePrice } = require('../services/priceService');

router.post('/', async (req, res) => {
  try {
    const { item } = req.body;
    
    if (!item) {
      return res.status(400).json({ error: 'Item is required' });
    }

    const priceData = await estimatePrice(item);
    res.json(priceData);
  } catch (error) {
    res.status(404).json({ error: error.message, requiresManual: true });
  }
});

module.exports = router;
