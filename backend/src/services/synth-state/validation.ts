import type { SynthParamPath, SynthState, Waveform } from '../../types/synth.js';
import { ValidationError } from '../../utils/errors.js';

const waveforms: Waveform[] = ['sine', 'saw', 'square', 'triangle'];
const paramPaths = new Set<SynthParamPath>([
  'osc1.waveform',
  'osc1.octave',
  'osc1.detune',
  'osc1.volume',
  'filter.enabled',
  'filter.cutoff',
  'filter.resonance',
  'filter.slope',
  'filter.envelope',
  'ampAdsr.attack',
  'ampAdsr.decay',
  'ampAdsr.sustain',
  'ampAdsr.release',
  'arpeggiator.enabled',
  'arpeggiator.rate',
  'global.midiChannel',
  'global.voices',
  'global.multiCore'
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const expectNumber = (path: string, value: unknown, min: number, max: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new ValidationError(`Valor invalido para ${path}. Esperado numero entre ${min} e ${max}.`, {
      path,
      value,
    });
  }
};

const expectBoolean = (path: string, value: unknown) => {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`Valor invalido para ${path}. Esperado booleano.`, { path, value });
  }
};

export function assertSynthParamPath(path: string): asserts path is SynthParamPath {
  if (!paramPaths.has(path as SynthParamPath)) {
    throw new ValidationError(`Parametro de synth desconhecido: ${path}`, { path });
  }
}

export const validateParamValue = (path: SynthParamPath, value: unknown) => {
  switch (path) {
    case 'osc1.waveform':
      if (!waveforms.includes(value as Waveform)) {
        throw new ValidationError('Forma de onda invalida.', { path, value, allowed: waveforms });
      }
      return;
    case 'osc1.octave':
      expectNumber(path, value, -2, 2);
      return;
    case 'osc1.detune':
    case 'osc1.volume':
    case 'filter.cutoff':
    case 'filter.resonance':
    case 'filter.envelope':
    case 'ampAdsr.attack':
    case 'ampAdsr.decay':
    case 'ampAdsr.sustain':
    case 'ampAdsr.release':
      expectNumber(path, value, 0, 100);
      return;
    case 'filter.enabled':
    case 'arpeggiator.enabled':
    case 'global.multiCore':
      expectBoolean(path, value);
      return;
    case 'filter.slope':
      if (value !== 12 && value !== 24) {
        throw new ValidationError('Slope de filtro invalido. Use 12 ou 24.', { path, value });
      }
      return;
    case 'arpeggiator.rate':
      expectNumber(path, value, 1, 32);
      return;
    case 'global.midiChannel':
      expectNumber(path, value, 1, 16);
      return;
    case 'global.voices':
      expectNumber(path, value, 1, 4);
      return;
  }
};

export const validateSynthState = (state: unknown): SynthState => {
  if (!isRecord(state)) {
    throw new ValidationError('Estado do synth invalido.');
  }

  const requiredGroups = ['osc1', 'filter', 'ampAdsr', 'arpeggiator', 'global'];
  for (const group of requiredGroups) {
    if (!isRecord(state[group])) {
      throw new ValidationError(`Grupo ausente ou invalido: ${group}`);
    }
  }

  for (const path of paramPaths) {
    const [group, key] = path.split('.') as [keyof SynthState, string];
    validateParamValue(path, (state[group] as Record<string, unknown>)[key]);
  }

  return state as unknown as SynthState;
};

export const isObjectRecord = isRecord;
