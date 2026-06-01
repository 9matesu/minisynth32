import { type SynthParamChange, type SynthParamPath, type SynthParamSource, type SynthState } from '../../types/synth.js';
export declare class SynthStateManager {
    private state;
    private readonly events;
    getState(): SynthState;
    replaceState(nextState: SynthState, source: SynthParamSource): void;
    setParam(path: SynthParamPath, value: unknown, source: SynthParamSource): SynthParamChange;
    onChanged(listener: (change: SynthParamChange) => void): void;
    onState(listener: (state: SynthState) => void): void;
    private assignPath;
    private flattenState;
}
