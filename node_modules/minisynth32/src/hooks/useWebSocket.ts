import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebSocketEventName, WsEnvelope } from '../types';

// ── Connection states ────────────────────────────────────────

export type WsConnectionState = 'connecting' | 'open' | 'closed' | 'error';

// ── Hook options ─────────────────────────────────────────────

export interface UseWebSocketOptions {
  /** WebSocket URL. Defaults to auto-detect from current host. */
  url?: string;
  /** Auto-reconnect on disconnect. Default true. */
  autoReconnect?: boolean;
  /** Max reconnect delay in ms. Default 8000. */
  maxReconnectDelay?: number;
  /** Base reconnect delay in ms. Default 500. */
  baseReconnectDelay?: number;
}

// ── Event listener type ──────────────────────────────────────

type WsEventListener = (payload: unknown, requestId?: string) => void;

// ── Return type ──────────────────────────────────────────────

export interface UseWebSocketReturn {
  connectionState: WsConnectionState;
  send: (event: WebSocketEventName, payload: unknown, requestId?: string) => void;
  on: (event: WebSocketEventName, listener: WsEventListener) => () => void;
}

// ── Helpers ──────────────────────────────────────────────────

function buildWsUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws`;
}

// ── Hook ─────────────────────────────────────────────────────

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url,
    autoReconnect = true,
    maxReconnectDelay = 8000,
    baseReconnectDelay = 500,
  } = options;

  const [connectionState, setConnectionState] = useState<WsConnectionState>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<WsEventListener>>>(new Map());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  // ── emit to listeners ──────────────────────────────────────
  const emit = useCallback((event: string, payload: unknown, requestId?: string) => {
    const listeners = listenersRef.current.get(event);
    if (!listeners) return;
    for (const listener of listeners) {
      try {
        listener(payload, requestId);
      } catch (err) {
        console.error(`[WS] Error in listener for "${event}"`, err);
      }
    }
  }, []);

  // ── connect ────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    const wsUrl = url ?? buildWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setConnectionState('connecting');

    ws.onopen = () => {
      if (unmountedRef.current) { ws.close(); return; }
      reconnectAttemptRef.current = 0;
      setConnectionState('open');
    };

    ws.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data as string) as WsEnvelope;
        emit(envelope.event, envelope.payload, envelope.requestId);
      } catch {
        console.warn('[WS] Failed to parse message', event.data);
      }
    };

    ws.onerror = () => {
      if (!unmountedRef.current) setConnectionState('error');
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setConnectionState('closed');
      wsRef.current = null;

      if (autoReconnect) {
        const attempt = reconnectAttemptRef.current++;
        const delay = Math.min(baseReconnectDelay * 2 ** attempt, maxReconnectDelay);
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };
  }, [url, autoReconnect, maxReconnectDelay, baseReconnectDelay, emit]);

  // ── lifecycle ──────────────────────────────────────────────
  useEffect(() => {
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  // ── send ───────────────────────────────────────────────────
  const send = useCallback((event: WebSocketEventName, payload: unknown, requestId?: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send, socket not open');
      return;
    }
    const envelope: WsEnvelope = { event, payload, requestId };
    ws.send(JSON.stringify(envelope));
  }, []);

  // ── on ─────────────────────────────────────────────────────
  const on = useCallback((event: WebSocketEventName, listener: WsEventListener): (() => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      listenersRef.current.get(event)?.delete(listener);
    };
  }, []);

  return { connectionState, send, on };
}
