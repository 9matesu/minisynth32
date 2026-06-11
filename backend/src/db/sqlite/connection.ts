import fs from 'node:fs';
import path from 'node:path';
import Database, { type Database as IDatabase } from 'better-sqlite3';
import { env } from '../../config/env.js';

let database: IDatabase | null = null;

export const getDatabase = (): IDatabase => {
  if (!database) {
    fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
    database = new Database(env.databasePath);
    database.pragma('journal_mode = WAL');
    database.pragma('foreign_keys = ON');
  }

  return database;
};
