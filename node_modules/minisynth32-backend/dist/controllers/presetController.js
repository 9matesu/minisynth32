import { ValidationError } from '../utils/errors.js';
const parseId = (value) => {
    const id = Number(Array.isArray(value) ? value[0] : value);
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError('ID invalido.');
    }
    return id;
};
export class PresetController {
    presets;
    synthState;
    constructor(presets, synthState) {
        this.presets = presets;
        this.synthState = synthState;
    }
    list = (_req, res) => {
        res.json({ presets: this.presets.list() });
    };
    show = (req, res) => {
        res.json({ preset: this.presets.get(parseId(req.params.id)) });
    };
    create = (req, res) => {
        const preset = this.presets.create(req.body);
        res.status(201).json({ preset });
    };
    update = (req, res) => {
        const preset = this.presets.update(parseId(req.params.id), req.body);
        res.json({ preset });
    };
    remove = (req, res) => {
        this.presets.delete(parseId(req.params.id));
        res.status(204).send();
    };
    load = (req, res) => {
        const preset = this.presets.get(parseId(req.params.id));
        this.synthState.replaceState(preset.state, 'preset');
        res.json({ preset, state: this.synthState.getState() });
    };
}
//# sourceMappingURL=presetController.js.map