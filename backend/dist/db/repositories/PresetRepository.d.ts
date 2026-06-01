import type { DatabaseSync } from 'node:sqlite';
import type { CreatePresetDto, UpdatePresetDto } from '../../types/dtos.js';
import type { PresetEntity } from '../../models/preset.js';
export declare class PresetRepository {
    private readonly db;
    constructor(db: DatabaseSync);
    findAll(): PresetEntity[];
    findById(id: number): PresetEntity | null;
    create(input: CreatePresetDto): PresetEntity;
    update(id: number, input: UpdatePresetDto): PresetEntity;
    delete(id: number): void;
    private toEntity;
}
