import { ValidationError } from '../utils/errors.js';
const parseId = (value) => {
    const id = Number(Array.isArray(value) ? value[0] : value);
    if (!Number.isInteger(id) || id < 1) {
        throw new ValidationError('ID invalido.');
    }
    return id;
};
export class MidiMappingController {
    midiMappings;
    constructor(midiMappings) {
        this.midiMappings = midiMappings;
    }
    list = (_req, res) => {
        res.json({ mappings: this.midiMappings.list() });
    };
    create = (req, res) => {
        const mapping = this.midiMappings.create(req.body);
        res.status(201).json({ mapping });
    };
    remove = (req, res) => {
        this.midiMappings.delete(parseId(req.params.id));
        res.status(204).send();
    };
}
//# sourceMappingURL=midiMappingController.js.map