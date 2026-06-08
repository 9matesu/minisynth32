import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { env } from '../../config/env.js';
let database = null;
export const getDatabase = () => {
    if (!database) {
        fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
        database = new DatabaseSync(env.databasePath);
        database.exec('PRAGMA journal_mode = WAL;');
        database.exec('PRAGMA foreign_keys = ON;');
    }
    return database;
};
//# sourceMappingURL=connection.js.map