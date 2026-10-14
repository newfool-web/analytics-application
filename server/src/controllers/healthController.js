import mongoose from 'mongoose';

export function getHealth(req, res) {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'ok', db: 'connected' });
  }

  return res.status(503).json({ status: 'degraded', db: 'disconnected' });
}

export default {
  getHealth
};
