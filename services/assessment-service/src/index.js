const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const assessmentRoutes = require('./routes/assessment.routes');
const { seedTemplates } = require('./seeds/templates.seed');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'assessment-service', timestamp: new Date().toISOString() });
});

app.use('/api/assessment', assessmentRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const start = async () => {
  await connectDB();
  await seedTemplates();
  app.listen(PORT, () => {
    console.log(`Assessment service running on port ${PORT}`);
  });
};

start();
