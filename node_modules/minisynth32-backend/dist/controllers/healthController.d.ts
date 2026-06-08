import type { Request, Response } from 'express';
import type { SerialService } from '../services/serial/SerialService.js';
export declare class HealthController {
    private readonly serial;
    constructor(serial: SerialService);
    show: (_req: Request, res: Response) => void;
}
