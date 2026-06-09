import type { Server as HttpServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import type { PresetService } from '../presets/PresetService.js';
import type { SerialService } from '../serial/SerialService.js';
import type { SynthStateManager } from '../synth-state/SynthStateManager.js';
import type { PresetLoadPayload, SynthParamSetPayload, WsEnvelope } from '../../types/websocket.js';
import { assertSynthParamPath } from '../synth-state/validation.js';
import { logger } from '../../utils/logger.js';
import { ValidationError } from '../../utils/errors.js';

interface WebSocketServiceDeps {
  httpServer: HttpServer;
  path: string;
  synthState: SynthStateManager;
  serial: SerialService;
  presets: PresetService;
}

export class WebSocketService {
  private readonly wss: WebSocketServer;

  constructor(private readonly deps: WebSocketServiceDeps) {
    this.wss = new WebSocketServer({ server: deps.httpServer, path: deps.path });
    this.registerServerEvents();
    this.registerDomainEvents();
  }

  broadcast<TPayload>(event: WsEnvelope['event'], payload: TPayload) {
    const message = JSON.stringify({ event, payload });
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  private registerServerEvents() {
    this.wss.on('connection', (socket) => {
      socket.send(
        JSON.stringify({
          event: 'connection:ready',
          payload: {
            state: this.deps.synthState.getState(),
            serial: this.deps.serial.getStatus(),
          },
        } satisfies WsEnvelope)
      );

      socket.on('message', (raw) => {
        this.handleClientMessage(socket, raw.toString()).catch((error) => this.sendError(socket, error));
      });
    });
  }

  private registerDomainEvents() {
    this.deps.synthState.onChanged((change) => {
      this.broadcast('synth:param:changed', change);
      this.broadcast('synth:state', this.deps.synthState.getState());
    });

    this.deps.serial.onStatus((status) => this.broadcast('serial:status', status));
    this.deps.serial.onError((error) => this.broadcast('serial:error', { message: error.message }));
  }

  private async handleClientMessage(socket: WebSocket, raw: string) {
    const message = this.parseEnvelope(raw);

    switch (message.event) {
      case 'synth:param:set': {
        const payload = message.payload as SynthParamSetPayload;
        assertSynthParamPath(payload.path);
        this.deps.synthState.setParam(payload.path, payload.value, 'frontend');
        this.deps.serial.sendParamSet(payload.path, payload.value);
        return;
      }
      case 'note:on': {
        const payload = message.payload as { note: string; freq: number };
        this.deps.serial.sendNoteOn(payload.note, payload.freq);
        return;
      }
      case 'note:off': {
        const payload = message.payload as { note: string; freq: number };
        this.deps.serial.sendNoteOff(payload.note, payload.freq);
        return;
      }
      case 'preset:save': {
        const preset = this.deps.presets.create(message.payload as never);
        this.broadcast('preset:list', { presets: this.deps.presets.list() });
        socket.send(JSON.stringify({ event: 'preset:save', payload: preset, requestId: message.requestId } satisfies WsEnvelope));
        return;
      }
      case 'preset:load': {
        const payload = message.payload as PresetLoadPayload;
        const preset = this.deps.presets.get(payload.id);
        this.deps.synthState.replaceState(preset.state, 'preset');
        socket.send(JSON.stringify({ event: 'preset:load', payload: preset, requestId: message.requestId } satisfies WsEnvelope));
        return;
      }
      case 'preset:list':
        socket.send(
          JSON.stringify({
            event: 'preset:list',
            payload: { presets: this.deps.presets.list() },
            requestId: message.requestId,
          } satisfies WsEnvelope)
        );
        return;
      default:
        throw new ValidationError(`Evento WebSocket nao suportado: ${message.event}`);
    }
  }

  private parseEnvelope(raw: string): WsEnvelope {
    try {
      const parsed = JSON.parse(raw) as WsEnvelope;
      if (!parsed.event) {
        throw new ValidationError('Mensagem WebSocket sem event.');
      }
      return parsed;
    } catch (error) {
      logger.warn('Invalid WebSocket payload', { raw });
      if (error instanceof ValidationError) throw error;
      throw new ValidationError('Mensagem WebSocket nao e JSON valido.');
    }
  }

  private sendError(socket: WebSocket, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    socket.send(JSON.stringify({ event: 'system:error', payload: { message } } satisfies WsEnvelope));
  }
}
