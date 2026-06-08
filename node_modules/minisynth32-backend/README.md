# MiniSynth32 Backend

Backend Node.js/TypeScript for MiniSynth32. It bridges the React/Vite frontend and an ESP32-S3 over USB serial, exposes REST APIs, publishes realtime WebSocket events, persists presets in SQLite, and can serve the built frontend in production.

## Folders

- `src/config`: environment parsing and app constants.
- `src/controllers`: HTTP controller functions.
- `src/routes`: Express route registration.
- `src/services`: application services for serial, WebSocket, presets, MIDI mappings, and synth state.
- `src/db`: SQLite connection, bootstrap migrations, and repositories.
- `src/middleware`: request/error logging and error handling.
- `src/models`: persisted domain models.
- `src/types`: shared contracts for synth state, WebSocket, serial, and REST DTOs.
- `src/utils`: small helpers such as logger and async route wrapper.

## Run in development

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

With `SERIAL_MOCK=true`, the backend emits mock ESP32 messages so the frontend can be developed without hardware.

## Run in production

```bash
cd frontend
npm run build

cd ../backend
npm run build
npm start
```

Set `FRONTEND_DIST=../frontend/dist` so Express can serve the React build.

## REST endpoints

Base URL: `http://localhost:3333/api`

- `GET /health`
- `GET /presets`
- `GET /presets/:id`
- `POST /presets`
- `PUT /presets/:id`
- `DELETE /presets/:id`
- `GET /midi-mappings`
- `POST /midi-mappings`
- `DELETE /midi-mappings/:id`

Preset payload:

```json
{
  "name": "Bass inicial",
  "description": "Preset de teste",
  "state": {
    "osc1": { "waveform": "square", "octave": 0, "volume": 80 },
    "filter": { "enabled": true, "cutoff": 65, "resonance": 35, "slope": 24, "envelope": 40 },
    "ampAdsr": { "attack": 10, "decay": 35, "sustain": 70, "release": 25 },
    "arpeggiator": { "enabled": false, "rate": 8 },
    "global": { "midiChannel": 1 },
    "waveDisplay": { "samples": [] }
  }
}
```

## WebSocket

Frontend connects to:

```text
ws://localhost:3333/ws
```

Important events:

- `connection:ready`
- `synth:state`
- `synth:param:set`
- `synth:param:changed`
- `preset:save`
- `preset:load`
- `preset:list`
- `serial:status`
- `serial:error`
- `system:error`

Example from frontend to backend:

```json
{ "event": "synth:param:set", "payload": { "path": "filter.cutoff", "value": 88 } }
```

Example broadcast from backend:

```json
{ "event": "synth:param:changed", "payload": { "path": "filter.cutoff", "value": 88, "source": "frontend" } }
```

## Serial protocol

The backend and ESP32 exchange JSON per line.

```json
{"type":"param_set","path":"osc1.detune","value":12}
{"type":"state_update","path":"filter.cutoff","value":88}
{"type":"ack","path":"filter.cutoff","ok":true}
{"type":"heartbeat","uptime":12345}
```

The backend does not depend on firmware internals; it only reads and writes this protocol.
