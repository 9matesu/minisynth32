import type { DatabaseSync } from 'node:sqlite';
import type { MidiMappingEntity } from '../../models/midiMapping.js';
import type { CreateMidiMappingDto } from '../../types/dtos.js';
export declare class MidiMappingRepository {
    private readonly db;
    constructor(db: DatabaseSync);
    findAll(): MidiMappingEntity[];
    create(input: CreateMidiMappingDto): MidiMappingEntity;
    delete(id: number): void;
    private toEntity;
}
