import type { SynthState } from './synth.js';

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

export interface UpdatePresetDto {
  name?: string;
  description?: string | null;
  state?: SynthState;
}

export interface MidiMappingDto {
  id: number;
  control: string;
  paramPath: string;
  midiCc: number;
  channel: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMidiMappingDto {
  control: string;
  paramPath: string;
  midiCc: number;
  channel: number;
}
