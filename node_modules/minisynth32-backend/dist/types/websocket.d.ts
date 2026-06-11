import type { PresetDto } from './dtos.js';
import type { SerialStatusPayload } from './serial.js';
import type { SynthParamPath, SynthState } from './synth.js';
export type WebSocketEventName = 'connection:ready' | 'synth:state' | 'synth:param:set' | 'synth:param:changed' | 'note:on' | 'note:off' | 'preset:save' | 'preset:load' | 'preset:list' | 'preset:delete' | 'serial:status' | 'serial:error' | 'system:error' | 'panic';
export interface WsEnvelope<TEvent extends WebSocketEventName = WebSocketEventName, TPayload = unknown> {
    event: TEvent;
    payload: TPayload;
    requestId?: string;
}
export interface SynthParamSetPayload {
    path: SynthParamPath;
    value: unknown;
}
export interface SynthParamChangedPayload extends SynthParamSetPayload {
    source: 'frontend' | 'serial' | 'preset' | 'system';
}
export interface ConnectionReadyPayload {
    state: SynthState;
    serial: SerialStatusPayload;
}
export interface SystemErrorPayload {
    message: string;
    code?: string;
    details?: unknown;
}
export interface PresetLoadPayload {
    id: number;
}
export interface PresetListPayload {
    presets: PresetDto[];
}
export interface NoteOnPayload {
    note: string;
    freq: number;
}
export interface NoteOffPayload {
    note?: string;
}
