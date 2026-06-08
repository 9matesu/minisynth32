import type { SynthParamPath } from './synth.js';
export type SerialStatus = 'mock' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type SerialMessage = {
    type: 'param_set';
    path: SynthParamPath;
    value: unknown;
} | {
    type: 'state_update';
    path: SynthParamPath;
    value: unknown;
} | {
    type: 'ack';
    path?: SynthParamPath;
    ok: boolean;
    error?: string;
} | {
    type: 'heartbeat';
    uptime: number;
} | {
    type: 'log';
    level: 'info' | 'warn' | 'error';
    message: string;
};
export interface SerialStatusPayload {
    status: SerialStatus;
    port?: string;
    mock: boolean;
}
