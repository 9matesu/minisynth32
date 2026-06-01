import type { SynthParamPath, SynthState } from '../../types/synth.js';
export declare function assertSynthParamPath(path: string): asserts path is SynthParamPath;
export declare const validateParamValue: (path: SynthParamPath, value: unknown) => void;
export declare const validateSynthState: (state: unknown) => SynthState;
export declare const isObjectRecord: (value: unknown) => value is Record<string, unknown>;
