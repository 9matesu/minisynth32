import type { Server as HttpServer } from 'node:http';
import type { PresetService } from '../presets/PresetService.js';
import type { SerialService } from '../serial/SerialService.js';
import type { SynthStateManager } from '../synth-state/SynthStateManager.js';
import type { WsEnvelope } from '../../types/websocket.js';
interface WebSocketServiceDeps {
    httpServer: HttpServer;
    path: string;
    synthState: SynthStateManager;
    serial: SerialService;
    presets: PresetService;
}
export declare class WebSocketService {
    private readonly deps;
    private readonly wss;
    constructor(deps: WebSocketServiceDeps);
    broadcast<TPayload>(event: WsEnvelope['event'], payload: TPayload): void;
    private registerServerEvents;
    private registerDomainEvents;
    private handleClientMessage;
    private parseEnvelope;
    private sendError;
}
export {};
