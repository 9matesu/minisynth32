export const migration001Initial = (db) => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      state_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS midi_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      control TEXT NOT NULL,
      param_path TEXT NOT NULL,
      midi_cc INTEGER NOT NULL,
      channel INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(param_path, midi_cc, channel)
    );
  `);
};
//# sourceMappingURL=001_initial.js.map