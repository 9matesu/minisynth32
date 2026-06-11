import { assertSynthParamPath } from '../synth-state/validation.js';
import { ValidationError } from '../../utils/errors.js';
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
export const encodeSerialMessage = (message) => `${JSON.stringify(message)}\n`;
export const parseSerialLine = (line) => {
    let parsed;
    try {
        parsed = JSON.parse(line);
    }
    catch {
        throw new ValidationError('Linha serial nao e JSON valido.', { line });
    }
    if (!isRecord(parsed) || typeof parsed.type !== 'string') {
        throw new ValidationError('Mensagem serial sem campo type.', { line });
    }
    switch (parsed.type) {
        case 'param_set':
        case 'state_update':
            if (typeof parsed.path !== 'string') {
                throw new ValidationError('Mensagem serial sem path.', parsed);
            }
            assertSynthParamPath(parsed.path);
            return { type: parsed.type, path: parsed.path, value: parsed.value };
        case 'ack':
            if (parsed.path !== undefined) {
                if (typeof parsed.path !== 'string') {
                    throw new ValidationError('ACK serial com path invalido.', parsed);
                }
                assertSynthParamPath(parsed.path);
            }
            return {
                type: 'ack',
                path: parsed.path,
                ok: Boolean(parsed.ok),
                error: typeof parsed.error === 'string' ? parsed.error : undefined,
            };
        case 'heartbeat':
            return { type: 'heartbeat', uptime: Number(parsed.uptime ?? 0) };
        case 'log':
            return {
                type: 'log',
                level: parsed.level === 'warn' || parsed.level === 'error' ? parsed.level : 'info',
                message: typeof parsed.message === 'string' ? parsed.message : '',
            };
        case 'note_on':
            return {
                type: 'note_on',
                note: typeof parsed.note === 'string' ? parsed.note : '',
                freq: Number(parsed.freq ?? 0),
            };
        case 'note_off':
            return {
                type: 'note_off',
                note: typeof parsed.note === 'string' ? parsed.note : '',
                freq: Number(parsed.freq ?? 0)
            };
        case 'panic':
            return { type: 'panic' };
        default:
            throw new ValidationError(`Tipo serial desconhecido: ${parsed.type}`, parsed);
    }
};
//# sourceMappingURL=SerialProtocol.js.map