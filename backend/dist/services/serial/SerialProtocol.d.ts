import type { SerialMessage } from '../../types/serial.js';
export declare const encodeSerialMessage: (message: SerialMessage) => string;
export declare const parseSerialLine: (line: string) => SerialMessage;
