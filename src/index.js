import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'my-secret-key-123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/chat', chatRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });