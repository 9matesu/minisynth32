import type { Request, Response } from 'express';
import type { PresetService } from '../services/presets/PresetService.js';
import type { SynthStateManager } from '../services/synth-state/SynthStateManager.js';
import { ValidationError } from '../utils/errors.js';

const parseId = (value: string | string[] | undefined) => {
  const id = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError('ID invalido.');
  }
  return id;
};

export class PresetController {
  constructor(
    private readonly presets: PresetService,
    private readonly synthState: SynthStateManager
  ) {}

  list = (_req: Request, res: Response) => {
    res.json({ presets: this.presets.list() });
  };

  show = (req: Request, res: Response) => {
    res.json({ preset: this.presets.get(parseId(req.params.id)) });
  };

  create = (req: Request, res: Response) => {
    const preset = this.presets.create(req.body);
    res.status(201).json({ preset });
  };

  update = (req: Request, res: Response) => {
    const preset = this.presets.update(parseId(req.params.id), req.body);
    res.json({ preset });
  };

  remove = (req: Request, res: Response) => {
    this.presets.delete(parseId(req.params.id));
    res.status(204).send();
  };

  load = (req: Request, res: Response) => {
    const preset = this.presets.get(parseId(req.params.id));
    this.synthState.replaceState(preset.state, 'preset');
    res.json({ preset, state: this.synthState.getState() });
  };
}
