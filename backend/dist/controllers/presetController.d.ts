import type { Request, Response } from 'express';
import type { PresetService } from '../services/presets/PresetService.js';
import type { SynthStateManager } from '../services/synth-state/SynthStateManager.js';
export declare class PresetController {
    private readonly presets;
    private readonly synthState;
    constructor(presets: PresetService, synthState: SynthStateManager);
    list: (_req: Request, res: Response) => void;
    show: (req: Request, res: Response) => void;
    create: (req: Request, res: Response) => void;
    update: (req: Request, res: Response) => void;
    remove: (req: Request, res: Response) => void;
    load: (req: Request, res: Response) => void;
}
