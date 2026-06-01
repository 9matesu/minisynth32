export type Waveform = 'square' | 'sine' | 'saw' | 'noise';
export type FilterSlope = 12 | 24;
export type SynthParamSource = 'frontend' | 'serial' | 'preset' | 'system';
export type SynthParamPath = 'osc1.waveform' | 'osc1.octave' | 'osc1.volume' | 'filter.enabled' | 'filter.cutoff' | 'filter.resonance' | 'filter.slope' | 'filter.envelope' | 'ampAdsr.attack' | 'ampAdsr.decay' | 'ampAdsr.sustain' | 'ampAdsr.release' | 'arpeggiator.enabled' | 'arpeggiator.rate' | 'global.midiChannel' | 'waveDisplay.samples';
export interface Osc1State {
    waveform: Waveform;
    octave: number;
    volume: number;
}
export interface FilterState {
    enabled: boolean;
    cutoff: number;
    resonance: number;
    slope: FilterSlope;
    envelope: number;
}
export interface AmpAdsrState {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
}
export interface ArpeggiatorState {
    enabled: boolean;
    rate: number;
}
export interface GlobalState {
    midiChannel: number;
}
export interface WaveDisplayState {
    samples: number[];
}
export interface SynthState {
    osc1: Osc1State;
    filter: FilterState;
    ampAdsr: AmpAdsrState;
    arpeggiator: ArpeggiatorState;
    global: GlobalState;
    waveDisplay: WaveDisplayState;
}
export interface SynthParamChange {
    path: SynthParamPath;
    value: unknown;
    source: SynthParamSource;
}
export declare const defaultSynthState: SynthState;
