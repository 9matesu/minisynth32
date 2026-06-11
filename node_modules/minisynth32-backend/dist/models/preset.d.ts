import type { SynthState, Waveform, FilterSlope } from '../types/synth.js';
export interface PresetRecord {
    id: number;
    name: string;
    description: string | null;
    osc1_waveform: Waveform;
    osc1_octave: number;
    osc1_detune: number;
    osc1_volume: number;
    filter_enabled: number;
    filter_cutoff: number;
    filter_resonance: number;
    filter_slope: FilterSlope;
    filter_envelope: number;
    ampAdsr_attack: number;
    ampAdsr_decay: number;
    ampAdsr_sustain: number;
    ampAdsr_release: number;
    arpeggiator_enabled: number;
    arpeggiator_rate: number;
    global_midiChannel: number;
    global_voices: number;
    global_multiCore: number;
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
