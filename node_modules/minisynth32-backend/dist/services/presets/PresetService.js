import { NotFoundError, ValidationError } from '../../utils/errors.js';
export class PresetService {
    presets;
    constructor(presets) {
        this.presets = presets;
    }
    list() {
        return this.presets.findAll();
    }
    get(id) {
        const preset = this.presets.findById(id);
        if (!preset) {
            throw new NotFoundError(`Preset ${id} nao encontrado.`);
        }
        return preset;
    }
    create(input) {
        this.assertName(input.name);
        return this.presets.create(input);
    }
    update(id, input) {
        if (input.name !== undefined) {
            this.assertName(input.name);
        }
        return this.presets.update(id, input);
    }
    delete(id) {
        this.presets.delete(id);
    }
    toDto(preset) {
        return preset;
    }
    assertName(name) {
        if (typeof name !== 'string' || name.trim().length < 1 || name.length > 80) {
            throw new ValidationError('Nome do preset deve ter entre 1 e 80 caracteres.');
        }
    }
}
//# sourceMappingURL=PresetService.js.map