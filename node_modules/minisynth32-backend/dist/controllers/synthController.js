import { assertSynthParamPath } from '../services/synth-state/validation.js';
export class SynthController {
    synthState;
    serial;
    constructor(synthState, serial) {
        this.synthState = synthState;
        this.serial = serial;
    }
    show = (_req, res) => {
        res.json({ state: this.synthState.getState() });
    };
    setParam = (req, res) => {
        const path = String(req.body.path);
        assertSynthParamPath(path);
        const change = this.synthState.setParam(path, req.body.value, 'frontend');
        this.serial.sendParamSet(path, req.body.value);
        res.json({ change, state: this.synthState.getState() });
    };
}
//# sourceMappingURL=synthController.js.map