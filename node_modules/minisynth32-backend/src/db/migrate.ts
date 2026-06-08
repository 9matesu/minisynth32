import { getDatabase } from './sqlite/connection.js';
import { migration001Initial } from './migrations/001_initial.js';
import { logger } from '../utils/logger.js';

export const runMigrations = () => {
  const db = getDatabase();
  migration001Initial(db);
  logger.info('SQLite migrations applied');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
