import type { Request, Response } from 'express';
import type { SynthStateManager } from '../services/synth-state/SynthStateManager.js';
import type { SerialService } from '../services/serial/SerialService.js';
export declare class SynthController {
    private readonly synthState;
    private readonly serial;
    constructor(synthState: SynthStateManager, serial: SerialService);
    show: (_req: Request, res: Response) => void;
    setParam: (req: Request, res: Response) => void;
}
