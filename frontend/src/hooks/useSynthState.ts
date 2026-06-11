import { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocket, type WsConnectionState } from './useWebSocket';
import type {
  ConnectionReadyPayload,
  CreatePresetDto,
  PresetDto,
  PresetListPayload,
  SerialStatusPayload,
  SynthParamChangedPayload,
  SynthParamPath,
  SynthState,
  SystemErrorPayload,
} from '../types';
import { DEFAULT_SYNTH_STATE } from '../types';

// ── Return type ──────────────────────────────────────────────

export interface UseSynthStateReturn {
  /** Current synth state, always in sync with backend */
  state: SynthState;
  /** Set a single synth param. Sends to backend and optimistically updates. */
  setParam: (path: SynthParamPath, value: unknown) => void;
  /** Replace full state (e.g. when loading a preset locally before backend roundtrip) */
  replaceState: (next: SynthState) => void;
  /** Backend-persisted presets */
  presets: PresetDto[];
  /** Load a preset by id — sends to backend, backend updates state */
  loadPreset: (id: number) => void;
  /** Save current state as new preset */
  savePreset: (name: string, description?: string) => void;
  /** Delete a preset by id */
  deletePreset: (id: number) => void;
  /** Refresh preset list from backend */
  refreshPresets: () => void;
  /** Serial port status from backend */
  serialStatus: SerialStatusPayload | null;
  /** WebSocket connection state */
  connectionState: WsConnectionState;
  /** Whether initial state has been received from backend */
  ready: boolean;
  /** Last system error from backend */
  lastError: string | null;
  /** Send MIDI Note On */
  sendNoteOn: (note: string, freq: number) => void;
  /** Send MIDI Note Off */
  sendNoteOff: (note: string, freq: number) => void;
  /** Send Panic / All Notes Off */
  sendPanic: () => void;
}

// ── Hook ─────────────────────────────────────────────────────

export function useSynthState(): UseSynthStateReturn {
  const ws = useWebSocket();

  const [state, setState] = useState<SynthState>(DEFAULT_SYNTH_STATE);
  const [presets, setPresets] = useState<PresetDto[]>([]);
  const [serialStatus, setSerialStatus] = useState<SerialStatusPayload | null>(null);
  const [ready, setReady] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (lastError) console.error('[Synth State Error]', lastError);
  }, [lastError]);

  // Ref to avoid stale closures in WS event handlers
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Register WebSocket event listeners ─────────────────────
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    // Initial connection — receive full state snapshot
    unsubs.push(
      ws.on('connection:ready', (payload) => {
        const data = payload as ConnectionReadyPayload;
        setState(data.state);
        setSerialStatus(data.serial);
        setReady(true);
        // Request preset list on connect
        ws.send('preset:list', {});
      })
    );

    // Full state broadcast (after replaceState on backend)
    unsubs.push(
      ws.on('synth:state', (payload) => {
        setState(payload as SynthState);
      })
    );

    // Individual param change (from serial, preset load, or other frontend)
    unsubs.push(
      ws.on('synth:param:changed', (payload) => {
        const change = payload as SynthParamChangedPayload;
        // Only apply if it came from serial/preset/system (not our own frontend echo)
        if (change.source !== 'frontend') {
          setState((prev) => assignParam(prev, change.path, change.value));
        }
      })
    );

    // Preset list
    unsubs.push(
      ws.on('preset:list', (payload) => {
        const data = payload as PresetListPayload;
        setPresets(data.presets);
      })
    );

    // Preset save confirmation
    unsubs.push(
      ws.on('preset:save', (payload) => {
        const saved = payload as PresetDto;
        setPresets((prev) => {
          if (prev.some((p) => p.id === saved.id)) return prev;
          return [saved, ...prev];
        });
      })
    );

    // Preset load confirmation — state already updated via synth:state broadcast
    unsubs.push(
      ws.on('preset:load', (_payload) => {
        // State will be updated via the synth:state broadcast
      })
    );

    // Preset delete confirmation
    unsubs.push(
      ws.on('preset:delete', (payload) => {
        const data = payload as { id: number };
        setPresets((prev) => prev.filter(p => p.id !== data.id));
      })
    );

    // Serial status
    unsubs.push(
      ws.on('serial:status', (payload) => {
        setSerialStatus(payload as SerialStatusPayload);
      })
    );

    // Serial error
    unsubs.push(
      ws.on('serial:error', (payload) => {
        const err = payload as { message: string };
        console.warn('[Serial Error]', err.message);
      })
    );

    // System error
    unsubs.push(
      ws.on('system:error', (payload) => {
        const err = payload as SystemErrorPayload;
        setLastError(err.message);
        console.error('[System Error]', err.message);
      })
    );

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [ws]);

  // ── Actions ────────────────────────────────────────────────

  const setParam = useCallback(
    (path: SynthParamPath, value: unknown) => {
      // Optimistic local update
      setState((prev) => assignParam(prev, path, value));
      // Send to backend
      ws.send('synth:param:set', { path, value });
    },
    [ws]
  );

  const replaceState = useCallback((next: SynthState) => {
    setState(next);
  }, []);

  const loadPreset = useCallback(
    (id: number) => {
      ws.send('preset:load', { id });
    },
    [ws]
  );

  const savePreset = useCallback(
    (name: string, description?: string) => {
      const dto: CreatePresetDto = {
        name,
        description: description ?? null,
        state: stateRef.current,
      };
      ws.send('preset:save', dto);
    },
    [ws]
  );

  const deletePreset = useCallback(
    (id: number) => {
      ws.send('preset:delete', { id });
    },
    [ws]
  );

  const refreshPresets = useCallback(() => {
    ws.send('preset:list', {});
  }, [ws]);

  const sendNoteOn = useCallback((note: string, freq: number) => {
    ws.send('note:on', { note, freq });
  }, [ws]);

  const sendNoteOff = useCallback((note: string, freq: number) => {
    ws.send('note:off', { note, freq });
  }, [ws]);

  const sendPanic = useCallback(() => {
    ws.send('panic', {});
  }, [ws]);

  return {
    state,
    setParam,
    replaceState,
    presets,
    loadPreset,
    savePreset,
    deletePreset,
    refreshPresets,
    sendNoteOn,
    sendNoteOff,
    sendPanic,
    serialStatus,
    connectionState: ws.connectionState,
    ready,
    lastError,
  };
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Immutably assign a value at a dot-path like "filter.cutoff" into a SynthState.
 */
function assignParam(state: SynthState, path: SynthParamPath, value: unknown): SynthState {
  const [group, key] = path.split('.') as [keyof SynthState, string];
  return {
    ...state,
    [group]: {
      ...state[group],
      [key]: value,
    },
  };
}
