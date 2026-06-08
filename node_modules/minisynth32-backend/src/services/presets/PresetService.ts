import type { PresetRepository } from '../../db/repositories/PresetRepository.js';
import type { CreatePresetDto, UpdatePresetDto } from '../../types/dtos.js';
import type { PresetEntity } from '../../models/preset.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export class PresetService {
  constructor(private readonly presets: PresetRepository) {}

  list() {
    return this.presets.findAll();
  }

  get(id: number) {
    const preset = this.presets.findById(id);
    if (!preset) {
      throw new NotFoundError(`Preset ${id} nao encontrado.`);
    }

    return preset;
  }

  create(input: CreatePresetDto) {
    this.assertName(input.name);
    return this.presets.create(input);
  }

  update(id: number, input: UpdatePresetDto) {
    if (input.name !== undefined) {
      this.assertName(input.name);
    }

    return this.presets.update(id, input);
  }

  delete(id: number) {
    this.presets.delete(id);
  }

  toDto(preset: PresetEntity) {
    return preset;
  }

  private assertName(name: unknown) {
    if (typeof name !== 'string' || name.trim().length < 1 || name.length > 80) {
      throw new ValidationError('Nome do preset deve ter entre 1 e 80 caracteres.');
    }
  }
}
