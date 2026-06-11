import type { Database } from 'better-sqlite3';
import type { CreatePresetDto, UpdatePresetDto } from '../../types/dtos.js';
import type { PresetEntity } from '../../models/preset.js';
export declare class PresetRepository {
    private readonly db;
    constructor(db: Database);
    findAll(): PresetEntity[];
    findById(id: number): PresetEntity | null;
    create(input: CreatePresetDto): PresetEntity;
    update(id: number, input: UpdatePresetDto): PresetEntity;
    delete(id: number): void;
    private toEntity;
}
