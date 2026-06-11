import type { SerialMessage, SerialStatusPayload } from '../../types/serial.js';
import type { SynthParamPath } from '../../types/synth.js';
interface SerialServiceOptions {
    port?: string;
    baudRate: number;
}
export declare class SerialService {
    private readonly events;
    private serialPort;
    private status;
    private options;
    private reconnectTimer;
    constructor(options: SerialServiceOptions);
    start(): Promise<void>;
    stop(): void;
    private scheduleReconnect;
    sendParamSet(path: SynthParamPath, value: unknown): void;
    sendNoteOn(note: string, freq: number): void;
    sendNoteOff(note: string, freq: number): void;
    sendPanic(): void;
    write(message: SerialMessage): void;
    getStatus(): {
        status: import("../../types/serial.js").SerialStatus;
        port?: string;
        error?: string;
    };
    onMessage(listener: (message: SerialMessage) => void): void;
    onStatus(listener: (status: SerialStatusPayload) => void): void;
    onError(listener: (error: Error) => void): void;
    private handleLine;
    private setStatus;
    private emitError;
}
export {};
