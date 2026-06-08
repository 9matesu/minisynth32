# Full-Stack Firmware Integration: Synth → Backend → Frontend

Integrate the ESP32 firmware (`codigo_synth`) with the Node.js backend and React frontend for fully bidirectional parameter sync, note playback, and live waveform display.

## User Review Required

> [!IMPORTANT]
> This plan involves changes to **all 3 layers** (firmware, backend, frontend). The firmware refactor converts from a 4-oscillator chord model to a monophonic synth with ADSR envelope — this is a significant behavior change on the hardware side.

> [!WARNING]
> **Waveform breaking change**: `noise` is being removed from backend types and replaced with `triangle`. Any existing presets stored in the SQLite database that reference `noise` will become invalid. The migration path is to update them to `triangle`.

---

## Proposed Changes

### 1. Firmware Refactor (ESP32)

#### [MODIFY] [codigo_synth_maximilian_Foda.ino](file:///c:/Users/Administrador.L103/minisynth32/firmware/codigo_synth_maximilian_Foda.ino)

**Monophonic synth refactor:**
- Remove the 4-oscillator chord model (`osc[4]`, `freqs_cmaj7/amaj7/fmaj7/gmaj7`, `playChordSequence()`)
- Use a single oscillator driven by `selectOsc()` which already maps waveIdx to sine/saw/square/triangle
- Implement a proper ADSR envelope generator (attack/decay/sustain/release) using Maximilian's `maxiEnv` or a custom state machine
- Add missing parameters to `SynthState` struct: `sustainLevel`, `releaseMs`, `resonance`, `filterEnvAmount`, `arpEnabled`, `arpRate`, `octave`

**Waveform selector fix:**
- The `play()` function currently hardcodes `osc[0].sawn()` — refactor to use `selectOsc(s.waveIdx, freq)` so the waveform knob actually controls the sound

**ADSR knob fix:**
- Currently `attackMs` and `decayMs` are read from pots but the envelope is never applied in `play()` — wire the ADSR envelope to modulate the output amplitude

**JSON Serial Protocol:**
- Parse incoming JSON lines from backend: `{"type":"param_set","path":"ampAdsr.attack","value":50}`
- Emit state updates: `{"type":"state_update","path":"osc1.waveform","value":"saw"}`
- Emit periodic heartbeat (500ms): `{"type":"heartbeat","uptime":12345}`
- Emit waveform samples (500ms): `{"type":"state_update","path":"waveDisplay.samples","value":[...]}`
- Handle note events: `{"type":"note_on","note":"C4","freq":261.63}` / `{"type":"note_off"}`

**Pot readings with deadband:**
- Continue reading pots every loop, but only emit `param_set` when a value changes by more than a threshold (±2 on 0-100 scale)
- Normalize pot readings to 0-100 for the serial protocol; map internally (e.g., attack 0→5ms, 100→505ms)

**Arpeggiator:**
- When `arpEnabled=true`, cycle through held notes (or a predefined pattern if no keys held) at the configured `arpRate` using `myClock`
- When `arpEnabled=false`, play the most recently received note

---

### 2. Backend Type Alignment

#### [MODIFY] [synth.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/types/synth.ts)
- Change `Waveform` type from `'square' | 'sine' | 'saw' | 'noise'` to `'square' | 'sine' | 'saw' | 'triangle'`
- Add `SynthParamPath` entries for note events: add `'note.on'` and `'note.off'` (or handle separately)

#### [MODIFY] [serial.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/types/serial.ts)
- Add `note_on` and `note_off` serial message types

#### [MODIFY] [websocket.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/types/websocket.ts)
- Add WebSocket event names: `'note:on'` and `'note:off'`
- Add `NoteOnPayload` and `NoteOffPayload` interfaces

---

### 3. Backend Validation Update

#### [MODIFY] [validation.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/services/synth-state/validation.ts)
- Change `waveforms` array from `['square', 'sine', 'saw', 'noise']` to `['square', 'sine', 'saw', 'triangle']`

---

### 4. Backend Serial Protocol Update

#### [MODIFY] [SerialProtocol.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/services/serial/SerialProtocol.ts)
- Add parsing for `note_on` and `note_off` message types from serial
- Handle encoding of note events to send to firmware

#### [MODIFY] [SerialService.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/services/serial/SerialService.ts)
- Add `sendNoteOn(note: string, freq: number)` and `sendNoteOff()` methods
- Update mock timer to use aligned waveform names (`'triangle'` instead of `'noise'`)

---

### 5. Backend WebSocket Update

#### [MODIFY] [WebSocketService.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/services/websocket/WebSocketService.ts)
- Handle `'note:on'` events from frontend → forward to serial
- Handle `'note:off'` events from frontend → forward to serial

#### [MODIFY] [server.ts](file:///c:/Users/Administrador.L103/minisynth32/backend/src/server.ts)
- Add serial message handling for `note_on` / `note_off` messages from the ESP32

---

### 6. Frontend WebSocket Hook

#### [NEW] [useSynthWebSocket.ts](file:///c:/Users/Administrador.L103/minisynth32/frontend/src/hooks/useSynthWebSocket.ts)

Custom React hook that:
- Opens a WebSocket connection to `ws://localhost:3333/ws`
- On `connection:ready` → initializes all synth state from the server's current state
- On `synth:param:changed` → updates local state for the affected parameter
- On `synth:state` → replaces full state
- On `serial:status` → tracks ESP32 connection status
- Exposes: `sendParam(path, value)` → sends `synth:param:set` envelope
- Exposes: `sendNoteOn(note, freq)` / `sendNoteOff()` → sends note events
- Handles reconnection with exponential backoff
- Maps between frontend `Patch` format and backend `SynthState` format

---

### 7. Frontend App Integration

#### [MODIFY] [App.tsx](file:///c:/Users/Administrador.L103/minisynth32/frontend/src/App.tsx)

- Import and use `useSynthWebSocket` hook
- Replace local `useState` patch management with WebSocket-backed state
- `updatePatch()` calls `sendParam()` for each parameter change
- Piano `handleNoteStart`/`handleNoteEnd` call `sendNoteOn`/`sendNoteOff`
- `WaveDisplay` renders live `waveDisplay.samples` as an SVG polyline
- Replace `WaveNoise` icon with `WaveTri` (triangle wave icon)
- Update `LedGroupBtn` in the wave selector to use `[WaveSquare, WaveSine, WaveSaw, WaveTri]`
- Add visual indicator for ESP32 serial connection status

#### [MODIFY] [Waves.tsx](file:///c:/Users/Administrador.L103/minisynth32/frontend/src/components/Waves.tsx)
- Export `WaveTri` component (triangle wave SVG icon) — already exists but was not imported in App.tsx
- Remove `WaveNoise` usage (it's defined inline in App.tsx, not in Waves.tsx)

---

### 8. Parameter Mapping (Frontend ↔ Backend ↔ Firmware)

| Frontend Patch Key | Backend SynthParamPath | Firmware Field | Range |
|---|---|---|---|
| `wave` (0-3) | `osc1.waveform` (string) | `waveIdx` (0-3) | 0=square, 1=sine, 2=saw, 3=triangle |
| `tune` (0-100) | `osc1.octave` (-2 to +2) | `octave` | Mapped: tune/25 - 2 |
| `level` (0-100) | `osc1.volume` (0-100) | `volume` | 0-100 normalized |
| `attack` (0-100) | `ampAdsr.attack` (0-100) | `attackMs` | Internal: 5-505ms |
| `decay` (0-100) | `ampAdsr.decay` (0-100) | `decayMs` | Internal: 30-1230ms |
| `sustain` (0-100) | `ampAdsr.sustain` (0-100) | `sustainLevel` | Internal: 0.0-1.0 |
| `release` (0-100) | `ampAdsr.release` (0-100) | `releaseMs` | Internal: 10-2000ms |
| `filterOn` (bool) | `filter.enabled` (bool) | `filterOn` | true/false |
| `cutoff` (0-100) | `filter.cutoff` (0-100) | `cutoffHz` | Internal: 200-6200Hz |
| `resonance` (0-100) | `filter.resonance` (0-100) | `resonance` | Internal: 0.1-1.0 |
| `envelope` (0-100) | `filter.envelope` (0-100) | `filterEnvAmt` | Internal: 0.0-1.0 |
| `filterSlope` (12/24) | `filter.slope` (12/24) | `filterSlope` | 12 or 24 |
| `arpOn` (bool) | `arpeggiator.enabled` (bool) | `arpEnabled` | true/false |
| `arpRate` (0-4) | `arpeggiator.rate` (1-32) | `arpRate` | Mapped to BPM subdivisions |

---

## Verification Plan

### Automated Tests
```bash
cd backend && npm run typecheck    # TypeScript compilation check
cd frontend && npx tsc --noEmit    # Frontend type check
```

### Manual Verification
1. Start the backend with `SERIAL_MOCK=true` → verify mock serial emits heartbeat + state updates
2. Start the frontend → verify WebSocket connects and synth state populates from server
3. Adjust knobs on frontend → verify `synth:param:set` messages appear in backend logs
4. Verify the WaveDisplay shows animated waveform from mock serial data
5. Click piano keys → verify `note:on`/`note:off` events flow through the system
6. Verify waveform selector cycles through Square → Sine → Saw → Triangle (not Noise)
7. Verify ADSR knobs display correct formatted values and send correct param paths
