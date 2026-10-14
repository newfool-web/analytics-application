import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required in environment variables');
}

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

export const env = {
  PORT,
  MONGODB_URI,
  CLIENT_ORIGIN,
  NODE_ENV
};

export { PORT, MONGODB_URI, CLIENT_ORIGIN, NODE_ENV };
export default env;
