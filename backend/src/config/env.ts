import dotenv from 'dotenv';
import { resolveProjectPath } from '../utils/paths.js';

dotenv.config();

const numberFromEnv = (name: string, fallback: number) => {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const booleanFromEnv = (name: string, fallback: boolean) => {
  const raw = process.env[name];
  if (!raw) return fallback;

  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  host: process.env.HOST ?? '0.0.0.0',
  port: numberFromEnv('PORT', 3333),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databasePath: resolveProjectPath(process.env.DATABASE_PATH ?? './data/minisynth32.sqlite'),
  serialMock: booleanFromEnv('SERIAL_MOCK', true),
  serialPort: process.env.SERIAL_PORT ?? '/dev/ttyACM0',
  serialBaudRate: numberFromEnv('SERIAL_BAUD_RATE', 115200),
  frontendDist: resolveProjectPath(process.env.FRONTEND_DIST ?? '../frontend/dist'),
};

export type Env = typeof env;
