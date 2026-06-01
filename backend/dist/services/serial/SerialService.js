import { EventEmitter } from 'node:events';
import { ReadlineParser } from '@serialport/parser-readline';
import { SerialPort } from 'serialport';
import { encodeSerialMessage, parseSerialLine } from './SerialProtocol.js';
import { logger } from '../../utils/logger.js';
export class SerialService {
    options;
    events = new EventEmitter();
    serialPort = null;
    mockTimer = null;
    status;
    constructor(options) {
        this.options = options;
        this.status = {
            status: options.mock ? 'mock' : 'disconnected',
            port: options.port,
            mock: options.mock,
        };
    }
    start() {
        if (this.options.mock) {
            this.startMock();
            return;
        }
        this.setStatus('connecting');
        const port = new SerialPort({ path: this.options.port, baudRate: this.options.baudRate, autoOpen: false });
        this.serialPort = port;
        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
        parser.on('data', (line) => this.handleLine(line));
        port.on('error', (error) => this.emitError(error));
        port.on('close', () => this.setStatus('disconnected'));
        port.open((error) => {
            if (error) {
                this.emitError(error);
                return;
            }
            this.setStatus('connected');
        });
    }
    stop() {
        if (this.mockTimer) {
            clearInterval(this.mockTimer);
            this.mockTimer = null;
        }
        if (this.serialPort?.isOpen) {
            this.serialPort.close();
        }
    }
    sendParamSet(path, value) {
        this.write({ type: 'param_set', path, value });
    }
    write(message) {
        const encoded = encodeSerialMessage(message);
        if (this.options.mock) {
            logger.info('Mock serial write', { message });
            this.events.emit('message', { type: 'ack', path: 'path' in message ? message.path : undefined, ok: true });
            return;
        }
        if (!this.serialPort?.isOpen) {
            this.emitError(new Error('Porta serial nao esta aberta.'));
            return;
        }
        this.serialPort.write(encoded, (error) => {
            if (error) {
                this.emitError(error);
            }
        });
    }
    getStatus() {
        return { ...this.status };
    }
    onMessage(listener) {
        this.events.on('message', listener);
    }
    onStatus(listener) {
        this.events.on('status', listener);
    }
    onError(listener) {
        this.events.on('error', listener);
    }
    startMock() {
        this.setStatus('mock');
        let uptime = 0;
        this.mockTimer = setInterval(() => {
            uptime += 1000;
            const cutoff = Math.round(35 + Math.sin(uptime / 5000) * 20 + 20);
            this.events.emit('message', { type: 'heartbeat', uptime });
            this.events.emit('message', { type: 'state_update', path: 'filter.cutoff', value: cutoff });
            this.events.emit('message', {
                type: 'state_update',
                path: 'waveDisplay.samples',
                value: Array.from({ length: 32 }, (_, index) => Math.sin(index / 4 + uptime / 400)),
            });
        }, 1000);
    }
    handleLine(line) {
        try {
            const message = parseSerialLine(line.trim());
            this.events.emit('message', message);
        }
        catch (error) {
            this.emitError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    setStatus(status) {
        this.status = {
            status,
            port: this.options.port,
            mock: this.options.mock,
        };
        this.events.emit('status', this.getStatus());
    }
    emitError(error) {
        this.status = {
            status: 'error',
            port: this.options.port,
            mock: this.options.mock,
        };
        logger.error('Serial error', { message: error.message });
        this.events.emit('error', error);
        this.events.emit('status', this.getStatus());
    }
}
//# sourceMappingURL=SerialService.js.map