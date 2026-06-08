import { useCallback, useEffect, useRef, useState } from 'react';

/* ── Shared type aliases matching the backend ───────────────────────────── */

type Waveform = 'sine' | 'saw' | 'square' | 'triangle';
type FilterSlope = 12 | 24;

export interface SynthState {
  osc1: { waveform: Waveform; octave: number; volume: number };
  filter: { enabled: boolean; cutoff: number; resonance: number; slope: FilterSlope; envelope: number };
  ampAdsr: { attack: number; decay: number; sustain: number; release: number };
  arpeggiator: { enabled: boolean; rate: number };
  global: { midiChannel: number };
  waveDisplay: { samples: number[] };
}

export type SynthParamPath =
  | 'osc1.waveform' | 'osc1.octave' | 'osc1.volume'
  | 'filter.enabled' | 'filter.cutoff' | 'filter.resonance' | 'filter.slope' | 'filter.envelope'
  | 'ampAdsr.attack' | 'ampAdsr.decay' | 'ampAdsr.sustain' | 'ampAdsr.release'
  | 'arpeggiator.enabled' | 'arpeggiator.rate'
  | 'global.midiChannel'
  | 'waveDisplay.samples';

export interface SerialStatus {
  status: 'mock' | 'connecting' | 'connected' | 'disconnected' | 'error';
  port?: string;
  mock: boolean;
}

/* ── Default state (matches backend defaultSynthState) ──────────────────── */

const DEFAULT_STATE: SynthState = {
  osc1: { waveform: 'saw', octave: 0, volume: 72 },
  filter: { enabled: true, cutoff: 58, resonance: 36, slope: 12, envelope: 42 },
  ampAdsr: { attack: 12, decay: 46, sustain: 78, release: 34 },
  arpeggiator: { enabled: false, rate: 8 },
  global: { midiChannel: 1 },
  waveDisplay: { samples: [] },
};

/* ── Patch ↔ SynthState conversion helpers ──────────────────────────────── */

const WAVEFORM_MAP: Waveform[] = ['square', 'sine', 'saw', 'triangle'];

export type Patch = {
  name: string;
  wave: number;       // 0-3 index
  tune: number;       // 0-100
  level: number;      // 0-100
  attack: number;     // 0-100
  decay: number;      // 0-100
  sustain: number;    // 0-100
  release: number;    // 0-100
  filterOn: boolean;
  cutoff: number;     // 0-100
  resonance: number;  // 0-100
  envelope: number;   // 0-100
  filterSlope: FilterSlope;
  arpOn: boolean;
  arpRate: number;    // 0-4 step index
};

export function synthStateToPatch(state: SynthState, name: string): Patch {
  return {
    name,
    wave: Math.max(0, WAVEFORM_MAP.indexOf(state.osc1.waveform)),
    tune: Math.round((state.osc1.octave + 2) * 25),
    level: state.osc1.volume,
    attack: state.ampAdsr.attack,
    decay: state.ampAdsr.decay,
    sustain: state.ampAdsr.sustain,
    release: state.ampAdsr.release,
    filterOn: state.filter.enabled,
    cutoff: state.filter.cutoff,
    resonance: state.filter.resonance,
    envelope: state.filter.envelope,
    filterSlope: state.filter.slope,
    arpOn: state.arpeggiator.enabled,
    arpRate: Math.round(state.arpeggiator.rate / 8),
  };
}

export function patchToSynthState(patch: Patch): SynthState {
  return {
    osc1: {
      waveform: WAVEFORM_MAP[patch.wave] ?? 'saw',
      octave: Math.round(patch.tune / 25) - 2,
      volume: patch.level,
    },
    filter: {
      enabled: patch.filterOn,
      cutoff: patch.cutoff,
      resonance: patch.resonance,
      slope: patch.filterSlope,
      envelope: patch.envelope,
    },
    ampAdsr: {
      attack: patch.attack,
      decay: patch.decay,
      sustain: patch.sustain,
      release: patch.release,
    },
    arpeggiator: {
      enabled: patch.arpOn,
      rate: patch.arpRate * 8 || 1,
    },
    global: { midiChannel: 1 },
    waveDisplay: { samples: [] },
  };
}

/* ── WebSocket Envelope ─────────────────────────────────────────────────── */

interface WsEnvelope {
  event: string;
  payload: unknown;
  requestId?: string;
}

/* ── The Hook ───────────────────────────────────────────────────────────── */

const WS_URL = `ws://${window.location.hostname}:3333/ws`;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface UseSynthWebSocketReturn {
  synthState: SynthState;
  serialStatus: SerialStatus;
  wsStatus: WsConnectionStatus;
  waveformSamples: number[];
  sendParam: (path: SynthParamPath, value: unknown) => void;
  sendNoteOn: (note: string, freq: number) => void;
  sendNoteOff: () => void;
}

export function useSynthWebSocket(): UseSynthWebSocketReturn {
  const [synthState, setSynthState] = useState<SynthState>(DEFAULT_STATE);
  const [serialStatus, setSerialStatus] = useState<SerialStatus>({ status: 'disconnected', mock: false });
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('disconnected');
  const [waveformSamples, setWaveformSamples] = useState<number[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = useCallback((event: string, payload: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, payload } satisfies WsEnvelope));
    }
  }, []);

  const sendParam = useCallback((path: SynthParamPath, value: unknown) => {
    // Optimistic local update
    setSynthState(prev => {
      const next = structuredClone(prev);
      const [group, key] = path.split('.') as [keyof SynthState, string];
      (next[group] as Record<string, unknown>)[key] = value;
      return next;
    });
    send('synth:param:set', { path, value });
  }, [send]);

  const sendNoteOn = useCallback((note: string, freq: number) => {
    send('note:on', { note, freq });
  }, [send]);

  const sendNoteOff = useCallback(() => {
    send('note:off', {});
  }, [send]);

  useEffect(() => {
    let disposed = false;

    function connect() {
      if (disposed) return;

      setWsStatus('connecting');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data) as WsEnvelope;
          handleMessage(envelope);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        scheduleReconnect();
      };

      ws.onerror = () => {
        // onclose will fire after onerror
      };
    }

    function handleMessage(envelope: WsEnvelope) {
      switch (envelope.event) {
        case 'connection:ready': {
          const payload = envelope.payload as { state: SynthState; serial: SerialStatus };
          setSynthState(payload.state);
          setSerialStatus(payload.serial);
          if (payload.state.waveDisplay?.samples) {
            setWaveformSamples(payload.state.waveDisplay.samples);
          }
          break;
        }
        case 'synth:state': {
          const state = envelope.payload as SynthState;
          setSynthState(state);
          if (state.waveDisplay?.samples) {
            setWaveformSamples(state.waveDisplay.samples);
          }
          break;
        }
        case 'synth:param:changed': {
          const payload = envelope.payload as { path: string; value: unknown; source: string };
          // Only apply changes from non-frontend sources to avoid echoing our own changes
          if (payload.source !== 'frontend') {
            setSynthState(prev => {
              const next = structuredClone(prev);
              const [group, key] = payload.path.split('.') as [keyof SynthState, string];
              (next[group] as Record<string, unknown>)[key] = payload.value;
              return next;
            });
            // Special handling for waveform samples (high-frequency updates)
            if (payload.path === 'waveDisplay.samples' && Array.isArray(payload.value)) {
              setWaveformSamples(payload.value as number[]);
            }
          }
          break;
        }
        case 'serial:status': {
          setSerialStatus(envelope.payload as SerialStatus);
          break;
        }
        case 'serial:error': {
          const err = envelope.payload as { message: string };
          console.warn('[WS] Serial error:', err.message);
          break;
        }
        case 'system:error': {
          const err = envelope.payload as { message: string };
          console.error('[WS] System error:', err.message);
          break;
        }
      }
    }

    function scheduleReconnect() {
      if (disposed) return;
      const attempt = reconnectAttemptRef.current++;
      const delay = Math.min(RECONNECT_BASE_MS * Math.pow(2, attempt), RECONNECT_MAX_MS);
      reconnectTimerRef.current = setTimeout(connect, delay);
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, []);

  return {
    synthState,
    serialStatus,
    wsStatus,
    waveformSamples,
    sendParam,
    sendNoteOn,
    sendNoteOff,
  };
}
