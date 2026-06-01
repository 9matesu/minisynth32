import { WebSocket, WebSocketServer } from 'ws';
import { assertSynthParamPath } from '../synth-state/validation.js';
import { logger } from '../../utils/logger.js';
import { ValidationError } from '../../utils/errors.js';
export class WebSocketService {
    deps;
    wss;
    constructor(deps) {
        this.deps = deps;
        this.wss = new WebSocketServer({ server: deps.httpServer, path: deps.path });
        this.registerServerEvents();
        this.registerDomainEvents();
    }
    broadcast(event, payload) {
        const message = JSON.stringify({ event, payload });
        for (const client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }
    registerServerEvents() {
        this.wss.on('connection', (socket) => {
            socket.send(JSON.stringify({
                event: 'connection:ready',
                payload: {
                    state: this.deps.synthState.getState(),
                    serial: this.deps.serial.getStatus(),
                },
            }));
            socket.on('message', (raw) => {
                this.handleClientMessage(socket, raw.toString()).catch((error) => this.sendError(socket, error));
            });
        });
    }
    registerDomainEvents() {
        this.deps.synthState.onChanged((change) => {
            this.broadcast('synth:param:changed', change);
            this.broadcast('synth:state', this.deps.synthState.getState());
        });
        this.deps.serial.onStatus((status) => this.broadcast('serial:status', status));
        this.deps.serial.onError((error) => this.broadcast('serial:error', { message: error.message }));
    }
    async handleClientMessage(socket, raw) {
        const message = this.parseEnvelope(raw);
        switch (message.event) {
            case 'synth:param:set': {
                const payload = message.payload;
                assertSynthParamPath(payload.path);
                this.deps.synthState.setParam(payload.path, payload.value, 'frontend');
                this.deps.serial.sendParamSet(payload.path, payload.value);
                return;
            }
            case 'preset:save': {
                const preset = this.deps.presets.create(message.payload);
                this.broadcast('preset:list', { presets: this.deps.presets.list() });
                socket.send(JSON.stringify({ event: 'preset:save', payload: preset, requestId: message.requestId }));
                return;
            }
            case 'preset:load': {
                const payload = message.payload;
                const preset = this.deps.presets.get(payload.id);
                this.deps.synthState.replaceState(preset.state, 'preset');
                socket.send(JSON.stringify({ event: 'preset:load', payload: preset, requestId: message.requestId }));
                return;
            }
            case 'preset:list':
                socket.send(JSON.stringify({
                    event: 'preset:list',
                    payload: { presets: this.deps.presets.list() },
                    requestId: message.requestId,
                }));
                return;
            default:
                throw new ValidationError(`Evento WebSocket nao suportado: ${message.event}`);
        }
    }
    parseEnvelope(raw) {
        try {
            const parsed = JSON.parse(raw);
            if (!parsed.event) {
                throw new ValidationError('Mensagem WebSocket sem event.');
            }
            return parsed;
        }
        catch (error) {
            logger.warn('Invalid WebSocket payload', { raw });
            if (error instanceof ValidationError)
                throw error;
            throw new ValidationError('Mensagem WebSocket nao e JSON valido.');
        }
    }
    sendError(socket, error) {
        const message = error instanceof Error ? error.message : String(error);
        socket.send(JSON.stringify({ event: 'system:error', payload: { message } }));
    }
}
//# sourceMappingURL=WebSocketService.js.map