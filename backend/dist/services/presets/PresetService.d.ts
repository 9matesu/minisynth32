import type { PresetRepository } from '../../db/repositories/PresetRepository.js';
import type { CreatePresetDto, UpdatePresetDto } from '../../types/dtos.js';
import type { PresetEntity } from '../../models/preset.js';
export declare class PresetService {
    private readonly presets;
    constructor(presets: PresetRepository);
    list(): PresetEntity[];
    get(id: number): PresetEntity;
    create(input: CreatePresetDto): PresetEntity;
    update(id: number, input: UpdatePresetDto): PresetEntity;
    delete(id: number): void;
    toDto(preset: PresetEntity): PresetEntity;
    private assertName;
}
