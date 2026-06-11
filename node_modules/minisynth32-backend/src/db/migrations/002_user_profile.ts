import type { Database } from 'better-sqlite3';

export const migration002UserProfile = (db: Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL DEFAULT 'user',
      xp INTEGER NOT NULL DEFAULT 0,
      completed_tasks TEXT NOT NULL DEFAULT '[]',
      settings TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Insert default user if not exists
  const stmt = db.prepare('SELECT count(*) as count FROM users WHERE id = 1');
  const result = stmt.get() as { count: number };
  if (result.count === 0) {
    db.exec(`INSERT INTO users (id, username, xp, completed_tasks, settings) VALUES (1, 'default_user', 0, '[]', '{}')`);
  }
};
