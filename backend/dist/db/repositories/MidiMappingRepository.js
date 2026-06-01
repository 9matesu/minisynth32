import { NotFoundError } from '../../utils/errors.js';
export class MidiMappingRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findAll() {
        const rows = this.db.prepare('SELECT * FROM midi_mappings ORDER BY id ASC').all();
        return rows.map(this.toEntity);
    }
    create(input) {
        const result = this.db
            .prepare('INSERT INTO midi_mappings (control, param_path, midi_cc, channel) VALUES (?, ?, ?, ?)')
            .run(input.control, input.paramPath, input.midiCc, input.channel);
        const row = this.db
            .prepare('SELECT * FROM midi_mappings WHERE id = ?')
            .get(Number(result.lastInsertRowid));
        return this.toEntity(row);
    }
    delete(id) {
        const result = this.db.prepare('DELETE FROM midi_mappings WHERE id = ?').run(id);
        if (result.changes === 0) {
            throw new NotFoundError(`Mapeamento MIDI ${id} nao encontrado.`);
        }
    }
    toEntity(row) {
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
//# sourceMappingURL=MidiMappingRepository.js.map