import type { SynthParamPath } from './synth.js';

export type SerialStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export type SerialMessage =
  | {
      type: 'param_set';
      path: SynthParamPath;
      value: unknown;
    }
  | {
      type: 'state_update';
      path: SynthParamPath;
      value: unknown;
    }
  | {
      type: 'ack';
      path?: SynthParamPath;
      ok: boolean;
      error?: string;
    }
  | {
      type: 'heartbeat';
      uptime: number;
    }
  | {
      type: 'log';
      level: 'info' | 'warn' | 'error';
      message: string;
    }
  | {
      type: 'note_on';
      note: string;
      freq: number;
    }
  | {
      type: 'note_off';
      note: string;
      freq: number;
    };

export interface SerialStatusPayload {
  status: SerialStatus;
  port?: string;
  error?: string;
}
