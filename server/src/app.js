import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/eventRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import env from './config/env.js';

const app = express();

const allowedOrigins = env.CLIENT_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: false
}));

app.use(express.json({ limit: '100kb' }));

app.use('/api', eventRoutes);

app.use(errorHandler);

export default app;
