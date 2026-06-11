import type { Database } from 'better-sqlite3';
import type { MidiMappingEntity } from '../../models/midiMapping.js';
import type { CreateMidiMappingDto } from '../../types/dtos.js';
export declare class MidiMappingRepository {
    private readonly db;
    constructor(db: Database);
    findAll(): MidiMappingEntity[];
    create(input: CreateMidiMappingDto): MidiMappingEntity;
    delete(id: number): void;
    private toEntity;
}
