import { EventEmitter } from 'node:events';
import { ReadlineParser } from '@serialport/parser-readline';
import { SerialPort } from 'serialport';
import type { SerialMessage, SerialStatusPayload } from '../../types/serial.js';
import type { SynthParamPath } from '../../types/synth.js';
import { encodeSerialMessage, parseSerialLine } from './SerialProtocol.js';
import { logger } from '../../utils/logger.js';

interface SerialServiceOptions {
  port?: string;
  baudRate: number;
}

export class SerialService {
  private readonly events = new EventEmitter();
  private serialPort: SerialPort | null = null;
  private status: SerialStatusPayload;
  private options: SerialServiceOptions;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: SerialServiceOptions) {
    this.options = options;
    this.status = {
      status: 'disconnected',
      port: options.port,
    };
  }

  async start() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.setStatus('connecting');

    try {
      let targetPort = this.options.port;

      if (!targetPort) {
        logger.info('No serial port specified, scanning for ESP32...');
        const ports = await SerialPort.list();
        
        // Try to find a CH340, CP210x or generic CDC device
        const espPort = ports.find(p => 
          (p.vendorId && p.productId) && 
          (p.vendorId.toLowerCase() === '1a86' || // CH340/CH343
           p.vendorId.toLowerCase() === '10c4' || // CP2102
           p.vendorId.toLowerCase() === '303a' || // ESP32 native USB
           p.vendorId.toLowerCase() === '0403')   // FTDI
        );

        if (espPort) {
          logger.info(`Found potential ESP32 device at ${espPort.path} (${espPort.manufacturer || 'Unknown'})`);
          targetPort = espPort.path;
        } else if (ports.length > 0) {
          logger.info(`No known ESP32 vendor IDs found. Defaulting to first available port: ${ports[0].path}`);
          targetPort = ports[0].path;
        } else {
          throw new Error('No serial ports found on the system.');
        }
      }

      this.options.port = targetPort;
      
      const port = new SerialPort({ path: targetPort, baudRate: this.options.baudRate, autoOpen: false });
      this.serialPort = port;

      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
      parser.on('data', (line: string) => this.handleLine(line));
      port.on('error', (error) => {
        this.emitError(error);
        this.scheduleReconnect();
      });
      port.on('close', () => {
        this.setStatus('disconnected');
        this.scheduleReconnect();
      });

      port.open((error) => {
        if (error) {
          this.emitError(error);
          this.scheduleReconnect();
          return;
        }
        logger.info(`Successfully connected to serial port: ${targetPort}`);
        this.setStatus('connected');
      });

    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect();
    }
  }

  stop() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.serialPort?.isOpen) {
      this.serialPort.close();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        logger.info('Attempting to reconnect to serial port...');
        this.start();
      }, 3000);
    }
  }

  sendParamSet(path: SynthParamPath, value: unknown) {
    this.write({ type: 'param_set', path, value });
  }

  sendNoteOn(note: string, freq: number) {
    this.write({ type: 'note_on', note, freq });
  }

  sendNoteOff(note: string, freq: number) {
    this.write({ type: 'note_off', note, freq });
  }

  write(message: SerialMessage) {
    const encoded = encodeSerialMessage(message);

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

  onMessage(listener: (message: SerialMessage) => void) {
    this.events.on('message', listener);
  }

  onStatus(listener: (status: SerialStatusPayload) => void) {
    this.events.on('status', listener);
  }

  onError(listener: (error: Error) => void) {
    this.events.on('error', listener);
  }

  private handleLine(line: string) {
    try {
      const message = parseSerialLine(line.trim());
      this.events.emit('message', message);
    } catch (error) {
      this.emitError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private setStatus(status: SerialStatusPayload['status']) {
    this.status = {
      status,
      port: this.options.port,
    };
    this.events.emit('status', this.getStatus());
  }

  private emitError(error: Error) {
    logger.error(`Serial Error: ${error.message}`);
    // If it's a ValidationError with a 'line' details, log it to help debugging
    const errWithDetails = error as Error & { details?: { line?: unknown } };
    if (errWithDetails.details && typeof errWithDetails.details.line === 'string') {
      logger.error(`Raw invalid line: ${errWithDetails.details.line}`);
    }
    this.status = {
      status: 'error',
      port: this.options.port,
      error: error.message,
    };
    this.events.emit('error', error);
    this.events.emit('status', this.getStatus());
  }
}
