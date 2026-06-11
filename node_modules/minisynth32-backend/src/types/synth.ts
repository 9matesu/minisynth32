export type Waveform = 'sine' | 'saw' | 'square' | 'triangle';
export type FilterSlope = 12 | 24;
export type SynthParamSource = 'frontend' | 'serial' | 'preset' | 'system';

export type SynthParamPath =
  | 'osc1.waveform'
  | 'osc1.octave'
  | 'osc1.detune'
  | 'osc1.volume'
  | 'filter.enabled'
  | 'filter.cutoff'
  | 'filter.resonance'
  | 'filter.slope'
  | 'filter.envelope'
  | 'ampAdsr.attack'
  | 'ampAdsr.decay'
  | 'ampAdsr.sustain'
  | 'ampAdsr.release'
  | 'arpeggiator.enabled'
  | 'arpeggiator.rate'
  | 'global.midiChannel'
  | 'global.voices'
  | 'global.multiCore';

export interface Osc1State {
  waveform: Waveform;
  octave: number;
  detune: number;
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
  voices: number;
  multiCore: boolean;
}

export interface SynthState {
  osc1: Osc1State;
  filter: FilterState;
  ampAdsr: AmpAdsrState;
  arpeggiator: ArpeggiatorState;
  global: GlobalState;
}

export interface SynthParamChange {
  path: SynthParamPath;
  value: unknown;
  source: SynthParamSource;
}

export const defaultSynthState: SynthState = {
  osc1: {
    waveform: 'saw',
    octave: 0,
    detune: 0,
    volume: 72,
  },
  filter: {
    enabled: true,
    cutoff: 58,
    resonance: 36,
    slope: 12,
    envelope: 42,
  },
  ampAdsr: {
    attack: 12,
    decay: 46,
    sustain: 78,
    release: 34,
  },
  arpeggiator: {
    enabled: false,
    rate: 8,
  },
  global: {
    midiChannel: 1,
    voices: 4,
    multiCore: true,
  }
};
