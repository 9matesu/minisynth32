import type { Request, Response } from 'express';
import type { SerialService } from '../services/serial/SerialService.js';

export class HealthController {
  constructor(private readonly serial: SerialService) {}

  show = (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'minisynth32-backend',
      serial: this.serial.getStatus(),
    });
  };
}
