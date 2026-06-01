import type { MidiMappingRepository } from '../../db/repositories/MidiMappingRepository.js';
import type { CreateMidiMappingDto } from '../../types/dtos.js';
export declare class MidiMappingService {
    private readonly mappings;
    constructor(mappings: MidiMappingRepository);
    list(): import("../../models/midiMapping.js").MidiMappingEntity[];
    create(input: CreateMidiMappingDto): import("../../models/midiMapping.js").MidiMappingEntity;
    delete(id: number): void;
}
