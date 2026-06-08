import type { SerialMessage, SerialStatusPayload } from '../../types/serial.js';
import type { SynthParamPath } from '../../types/synth.js';
interface SerialServiceOptions {
    mock: boolean;
    port: string;
    baudRate: number;
}
export declare class SerialService {
    private readonly options;
    private readonly events;
    private serialPort;
    private mockTimer;
    private status;
    constructor(options: SerialServiceOptions);
    start(): void;
    stop(): void;
    sendParamSet(path: SynthParamPath, value: unknown): void;
    write(message: SerialMessage): void;
    getStatus(): {
        status: import("../../types/serial.js").SerialStatus;
        port?: string;
        mock: boolean;
    };
    onMessage(listener: (message: SerialMessage) => void): void;
    onStatus(listener: (status: SerialStatusPayload) => void): void;
    onError(listener: (error: Error) => void): void;
    private startMock;
    private handleLine;
    private setStatus;
    private emitError;
}
export {};
