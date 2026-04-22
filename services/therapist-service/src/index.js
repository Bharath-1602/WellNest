const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const therapistRoutes = require('./routes/therapist.routes');
const { seedAvailability } = require('./seeds/availability.seed');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'therapist-service', timestamp: new Date().toISOString() });
});

app.use('/api/therapist', therapistRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const start = async () => {
  await connectDB();
  setTimeout(() => seedAvailability(), 3000);
  app.listen(PORT, () => {
    console.log(`Therapist service running on port ${PORT}`);
  });
};

start();
