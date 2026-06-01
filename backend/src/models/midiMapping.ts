export interface MidiMappingRecord {
  id: number;
  control: string;
  param_path: string;
  midi_cc: number;
  channel: number;
  created_at: string;
  updated_at: string;
}

export interface MidiMappingEntity {
  id: number;
  control: string;
  paramPath: string;
  midiCc: number;
  channel: number;
  createdAt: string;
  updatedAt: string;
}
