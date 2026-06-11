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
            .prepare(`INSERT INTO presets (
        name, description,
        osc1_waveform, osc1_octave, osc1_detune, osc1_volume,
        filter_enabled, filter_cutoff, filter_resonance, filter_slope, filter_envelope,
        ampAdsr_attack, ampAdsr_decay, ampAdsr_sustain, ampAdsr_release,
        arpeggiator_enabled, arpeggiator_rate,
        global_midiChannel, global_voices, global_multiCore
      ) VALUES (
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?
      )`)
            .run(input.name, input.description ?? null, state.osc1.waveform, state.osc1.octave, state.osc1.detune, state.osc1.volume, state.filter.enabled ? 1 : 0, state.filter.cutoff, state.filter.resonance, state.filter.slope, state.filter.envelope, state.ampAdsr.attack, state.ampAdsr.decay, state.ampAdsr.sustain, state.ampAdsr.release, state.arpeggiator.enabled ? 1 : 0, state.arpeggiator.rate, state.global.midiChannel, state.global.voices, state.global.multiCore ? 1 : 0);
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
            .prepare(`UPDATE presets SET 
        name = ?, description = ?, 
        osc1_waveform = ?, osc1_octave = ?, osc1_detune = ?, osc1_volume = ?,
        filter_enabled = ?, filter_cutoff = ?, filter_resonance = ?, filter_slope = ?, filter_envelope = ?,
        ampAdsr_attack = ?, ampAdsr_decay = ?, ampAdsr_sustain = ?, ampAdsr_release = ?,
        arpeggiator_enabled = ?, arpeggiator_rate = ?,
        global_midiChannel = ?, global_voices = ?, global_multiCore = ?,
        updated_at = datetime('now') 
        WHERE id = ?`)
            .run(next.name, next.description ?? null, next.state.osc1.waveform, next.state.osc1.octave, next.state.osc1.detune, next.state.osc1.volume, next.state.filter.enabled ? 1 : 0, next.state.filter.cutoff, next.state.filter.resonance, next.state.filter.slope, next.state.filter.envelope, next.state.ampAdsr.attack, next.state.ampAdsr.decay, next.state.ampAdsr.sustain, next.state.ampAdsr.release, next.state.arpeggiator.enabled ? 1 : 0, next.state.arpeggiator.rate, next.state.global.midiChannel, next.state.global.voices, next.state.global.multiCore ? 1 : 0, id);
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
            state: {
                osc1: {
                    waveform: row.osc1_waveform,
                    octave: row.osc1_octave,
                    detune: row.osc1_detune,
                    volume: row.osc1_volume,
                },
                filter: {
                    enabled: row.filter_enabled === 1,
                    cutoff: row.filter_cutoff,
                    resonance: row.filter_resonance,
                    slope: row.filter_slope,
                    envelope: row.filter_envelope,
                },
                ampAdsr: {
                    attack: row.ampAdsr_attack,
                    decay: row.ampAdsr_decay,
                    sustain: row.ampAdsr_sustain,
                    release: row.ampAdsr_release,
                },
                arpeggiator: {
                    enabled: row.arpeggiator_enabled === 1,
                    rate: row.arpeggiator_rate,
                },
                global: {
                    midiChannel: row.global_midiChannel,
                    voices: row.global_voices,
                    multiCore: row.global_multiCore === 1,
                }
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
//# sourceMappingURL=PresetRepository.js.map