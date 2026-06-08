import type { Request, Response } from 'express';
import type { MidiMappingService } from '../services/midi/MidiMappingService.js';
export declare class MidiMappingController {
    private readonly midiMappings;
    constructor(midiMappings: MidiMappingService);
    list: (_req: Request, res: Response) => void;
    create: (req: Request, res: Response) => void;
    remove: (req: Request, res: Response) => void;
}
