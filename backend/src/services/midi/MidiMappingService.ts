import type { MidiMappingRepository } from '../../db/repositories/MidiMappingRepository.js';
import type { CreateMidiMappingDto } from '../../types/dtos.js';
import { assertSynthParamPath } from '../synth-state/validation.js';
import { ValidationError } from '../../utils/errors.js';

export class MidiMappingService {
  constructor(private readonly mappings: MidiMappingRepository) {}

  list() {
    return this.mappings.findAll();
  }

  create(input: CreateMidiMappingDto) {
    if (typeof input.control !== 'string' || input.control.trim().length === 0) {
      throw new ValidationError('Controle MIDI invalido.');
    }

    assertSynthParamPath(input.paramPath);

    if (!Number.isInteger(input.midiCc) || input.midiCc < 0 || input.midiCc > 127) {
      throw new ValidationError('midiCc deve estar entre 0 e 127.');
    }

    if (!Number.isInteger(input.channel) || input.channel < 1 || input.channel > 16) {
      throw new ValidationError('Canal MIDI deve estar entre 1 e 16.');
    }

    return this.mappings.create(input);
  }

  delete(id: number) {
    this.mappings.delete(id);
  }
}
