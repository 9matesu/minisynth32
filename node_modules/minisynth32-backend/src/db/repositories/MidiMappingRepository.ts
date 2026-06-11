import type { Database } from 'better-sqlite3';
import type { MidiMappingEntity, MidiMappingRecord } from '../../models/midiMapping.js';
import type { CreateMidiMappingDto } from '../../types/dtos.js';
import { NotFoundError } from '../../utils/errors.js';

export class MidiMappingRepository {
  constructor(private readonly db: Database) {}

  findAll(): MidiMappingEntity[] {
    const rows = this.db.prepare('SELECT * FROM midi_mappings ORDER BY id ASC').all() as MidiMappingRecord[];
    return rows.map(this.toEntity);
  }

  create(input: CreateMidiMappingDto): MidiMappingEntity {
    const result = this.db
      .prepare('INSERT INTO midi_mappings (control, param_path, midi_cc, channel) VALUES (?, ?, ?, ?)')
      .run(input.control, input.paramPath, input.midiCc, input.channel);

    const row = this.db
      .prepare('SELECT * FROM midi_mappings WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as MidiMappingRecord;

    return this.toEntity(row);
  }

  delete(id: number) {
    const result = this.db.prepare('DELETE FROM midi_mappings WHERE id = ?').run(id);
    if (result.changes === 0) {
      throw new NotFoundError(`Mapeamento MIDI ${id} nao encontrado.`);
    }
  }

  private toEntity(row: MidiMappingRecord): MidiMappingEntity {
    return {
      id: row.id,
      control: row.control,
      paramPath: row.param_path,
      midiCc: row.midi_cc,
      channel: row.channel,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
