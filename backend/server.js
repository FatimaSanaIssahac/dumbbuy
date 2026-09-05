require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRoute = require('./routes/analyze');
const priceRoute = require('./routes/price');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/price', priceRoute);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sadhya Optimization Backend is running.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
