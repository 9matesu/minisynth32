/* ─────────────────────────────────────────────────────────────
   Shared types that mirror the backend contracts.
   Kept in the frontend so we don't import from the backend.
   ───────────────────────────────────────────────────────────── */

// ── Synth state ──────────────────────────────────────────────

export interface UserProfile {
  id: number;
  username: string;
  xp: number;
  completedTasks: string[];
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type Waveform = 'square' | 'sine' | 'saw' | 'triangle';
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

export const DEFAULT_SYNTH_STATE: SynthState = {
  osc1: { waveform: 'square', octave: 0, detune: 0, volume: 72 },
  filter: { enabled: true, cutoff: 58, resonance: 36, slope: 12, envelope: 42 },
  ampAdsr: { attack: 12, decay: 46, sustain: 78, release: 34 },
  arpeggiator: { enabled: false, rate: 8 },
  global: { midiChannel: 1, voices: 4, multiCore: true },
};

// ── Presets ───────────────────────────────────────────────────

export interface PresetDto {
  id: number;
  name: string;
  description: string | null;
  state: SynthState;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresetDto {
  name: string;
  description?: string | null;
  state: SynthState;
}

// ── Serial ───────────────────────────────────────────────────

export type SerialStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SerialStatusPayload {
  status: SerialStatus;
  port?: string;
  error?: string;
}

// ── WebSocket envelope ───────────────────────────────────────

export type WebSocketEventName =
  | 'connection:ready'
  | 'synth:state'
  | 'synth:param:set'
  | 'synth:param:changed'
  | 'preset:save'
  | 'preset:load'
  | 'preset:list'
  | 'preset:delete'
  | 'serial:status'
  | 'serial:error'
  | 'system:error'
  | 'note:on'
  | 'note:off'
  | 'panic';

export interface WsEnvelope<TPayload = unknown> {
  event: WebSocketEventName;
  payload: TPayload;
  requestId?: string;
}

export interface SynthParamSetPayload {
  path: SynthParamPath;
  value: unknown;
}

export interface SynthParamChangedPayload extends SynthParamSetPayload {
  source: SynthParamSource;
}

export interface ConnectionReadyPayload {
  state: SynthState;
  serial: SerialStatusPayload;
}

export interface PresetListPayload {
  presets: PresetDto[];
}

export interface SystemErrorPayload {
  message: string;
  code?: string;
  details?: unknown;
}
