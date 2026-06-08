import { NotFoundError } from '../../utils/errors.js';
import { validateSynthState } from '../../services/synth-state/validation.js';
export class PresetRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    findAll() {
        const rows = this.db.prepare('SELECT * FROM presets ORDER BY updated_at DESC').all();
        return rows.map(this.toEntity);
    }
    findById(id) {
        const row = this.db.prepare('SELECT * FROM presets WHERE id = ?').get(id);
        return row ? this.toEntity(row) : null;
    }
    create(input) {
        const state = validateSynthState(input.state);
        const result = this.db
            .prepare('INSERT INTO presets (name, description, state_json) VALUES (?, ?, ?)')
            .run(input.name, input.description ?? null, JSON.stringify(state));
        return this.findById(Number(result.lastInsertRowid));
    }
    update(id, input) {
        const current = this.findById(id);
        if (!current) {
            throw new NotFoundError(`Preset ${id} nao encontrado.`);
        }
        const next = {
            name: input.name ?? current.name,
            description: input.description === undefined ? current.description : input.description,
            state: input.state ? validateSynthState(input.state) : current.state,
        };
        this.db
            .prepare("UPDATE presets SET name = ?, description = ?, state_json = ?, updated_at = datetime('now') WHERE id = ?")
            .run(next.name, next.description ?? null, JSON.stringify(next.state), id);
        return this.findById(id);
    }
    delete(id) {
        const result = this.db.prepare('DELETE FROM presets WHERE id = ?').run(id);
        if (result.changes === 0) {
            throw new NotFoundError(`Preset ${id} nao encontrado.`);
        }
    }
    toEntity(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            state: validateSynthState(JSON.parse(row.state_json)),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
//# sourceMappingURL=PresetRepository.js.map