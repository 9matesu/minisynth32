import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../../config/env.js';
let database = null;
export const getDatabase = () => {
    if (!database) {
        fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
        database = new Database(env.databasePath);
        database.pragma('journal_mode = WAL');
        database.pragma('foreign_keys = ON');
    }
    return database;
};
//# sourceMappingURL=connection.js.map