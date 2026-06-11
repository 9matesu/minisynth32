import { EventEmitter } from 'node:events';
import { defaultSynthState, type SynthParamChange, type SynthParamPath, type SynthParamSource, type SynthState } from '../../types/synth.js';
import { validateParamValue, validateSynthState } from './validation.js';

type StateEvents = {
  changed: [SynthParamChange];
  state: [SynthState];
};

export class SynthStateManager {
  private state: SynthState = structuredClone(defaultSynthState);
  private readonly events = new EventEmitter();

  getState() {
    return structuredClone(this.state);
  }

  replaceState(nextState: SynthState, source: SynthParamSource) {
    this.state = structuredClone(validateSynthState(nextState));
    this.events.emit('state', this.getState());

    for (const [path, value] of this.flattenState(this.state)) {
      this.events.emit('changed', { path, value, source });
    }
  }

  setParam(path: SynthParamPath, value: unknown, source: SynthParamSource) {
    validateParamValue(path, value);
    this.assignPath(path, value);

    const change: SynthParamChange = { path, value, source };
    this.events.emit('changed', change);
    return change;
  }

  onChanged(listener: (change: SynthParamChange) => void) {
    this.events.on('changed', listener);
  }

  onState(listener: (state: SynthState) => void) {
    this.events.on('state', listener);
  }

  private assignPath(path: SynthParamPath, value: unknown) {
    const [group, key] = path.split('.') as [keyof SynthState, string];
    (this.state[group] as unknown as Record<string, unknown>)[key] = value;
  }

  private flattenState(state: SynthState): Array<[SynthParamPath, unknown]> {
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
