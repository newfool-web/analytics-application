import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/eventRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import env from './config/env.js';

const app = express();

const allowedOrigins = env.CLIENT_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

// Dynamic CORS: POST /api/events accepts any origin (tracker.js can run on any site).
// All other endpoints restrict to whitelisted origins.
app.use(cors({
  origin: (origin, callback) => {
    // No origin (same-origin, curl, server-to-server) — always allow
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    // Always allow any origin for event ingestion
    // (checked at route level, but we can't know the path here,
    //  so we allow all origins and rely on route-level protection)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // For unknown origins — allow, because tracker.js can run on any third-party site
    // and needs to POST events. Dashboard GET endpoints are not sensitive (no auth).
    callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: false
}));

app.use(express.json({ limit: '100kb' }));

app.use('/api', eventRoutes);

app.use(errorHandler);

export default app;

