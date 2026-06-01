import type { Request, Response } from 'express';
import type { SynthStateManager } from '../services/synth-state/SynthStateManager.js';
import type { SerialService } from '../services/serial/SerialService.js';
import { assertSynthParamPath } from '../services/synth-state/validation.js';

export class SynthController {
  constructor(
    private readonly synthState: SynthStateManager,
    private readonly serial: SerialService
  ) {}

  show = (_req: Request, res: Response) => {
    res.json({ state: this.synthState.getState() });
  };

  setParam = (req: Request, res: Response) => {
    const path = String(req.body.path);
    assertSynthParamPath(path);

    const change = this.synthState.setParam(path, req.body.value, 'frontend');
    this.serial.sendParamSet(path, req.body.value);
    res.json({ change, state: this.synthState.getState() });
  };
}
