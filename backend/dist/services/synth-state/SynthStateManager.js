import { EventEmitter } from 'node:events';
import { defaultSynthState } from '../../types/synth.js';
import { validateParamValue, validateSynthState } from './validation.js';
export class SynthStateManager {
    state = structuredClone(defaultSynthState);
    events = new EventEmitter();
    getState() {
        return structuredClone(this.state);
    }
    replaceState(nextState, source) {
        this.state = structuredClone(validateSynthState(nextState));
        this.events.emit('state', this.getState());
        for (const [path, value] of this.flattenState(this.state)) {
            this.events.emit('changed', { path, value, source });
        }
    }
    setParam(path, value, source) {
        validateParamValue(path, value);
        this.assignPath(path, value);
        const change = { path, value, source };
        this.events.emit('changed', change);
        return change;
    }
    onChanged(listener) {
        this.events.on('changed', listener);
    }
    onState(listener) {
        this.events.on('state', listener);
    }
    assignPath(path, value) {
        const [group, key] = path.split('.');
        this.state[group][key] = value;
    }
    flattenState(state) {
        return [
            ['osc1.waveform', state.osc1.waveform],
            ['osc1.octave', state.osc1.octave],
            ['osc1.detune', state.osc1.detune],
            ['osc1.volume', state.osc1.volume],
            ['filter.enabled', state.filter.enabled],
            ['filter.cutoff', state.filter.cutoff],
            ['filter.resonance', state.filter.resonance],
            ['filter.slope', state.filter.slope],
            ['filter.envelope', state.filter.envelope],
            ['ampAdsr.attack', state.ampAdsr.attack],
            ['ampAdsr.decay', state.ampAdsr.decay],
            ['ampAdsr.sustain', state.ampAdsr.sustain],
            ['ampAdsr.release', state.ampAdsr.release],
            ['arpeggiator.enabled', state.arpeggiator.enabled],
            ['arpeggiator.rate', state.arpeggiator.rate],
            ['global.midiChannel', state.global.midiChannel],
            ['global.voices', state.global.voices],
            ['global.multiCore', state.global.multiCore],
        ];
    }
}
//# sourceMappingURL=SynthStateManager.js.map