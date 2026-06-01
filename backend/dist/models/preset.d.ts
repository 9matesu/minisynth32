import type { SynthState } from '../types/synth.js';
export interface PresetRecord {
    id: number;
    name: string;
    description: string | null;
    state_json: string;
    created_at: string;
    updated_at: string;
}
export interface PresetEntity {
    id: number;
    name: string;
    description: string | null;
    state: SynthState;
    createdAt: string;
    updatedAt: string;
}
