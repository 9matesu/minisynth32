import type { Database } from 'better-sqlite3';

export const migration001Initial = (db: Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      
      -- osc1
      osc1_waveform TEXT NOT NULL,
      osc1_octave INTEGER NOT NULL,
      osc1_detune INTEGER NOT NULL,
      osc1_volume INTEGER NOT NULL,
      
      -- filter
      filter_enabled INTEGER NOT NULL,
      filter_cutoff INTEGER NOT NULL,
      filter_resonance INTEGER NOT NULL,
      filter_slope INTEGER NOT NULL,
      filter_envelope INTEGER NOT NULL,
      
      -- ampAdsr
      ampAdsr_attack INTEGER NOT NULL,
      ampAdsr_decay INTEGER NOT NULL,
      ampAdsr_sustain INTEGER NOT NULL,
      ampAdsr_release INTEGER NOT NULL,
      
      -- arpeggiator
      arpeggiator_enabled INTEGER NOT NULL,
      arpeggiator_rate INTEGER NOT NULL,
      
      -- global
      global_midiChannel INTEGER NOT NULL,
      global_voices INTEGER NOT NULL,
      global_multiCore INTEGER NOT NULL,

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
