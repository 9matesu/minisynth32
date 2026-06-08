import type { Request, Response } from 'express';
import type { MidiMappingService } from '../services/midi/MidiMappingService.js';
import { ValidationError } from '../utils/errors.js';

const parseId = (value: string | string[] | undefined) => {
  const id = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError('ID invalido.');
  }
  return id;
};

export class MidiMappingController {
  constructor(private readonly midiMappings: MidiMappingService) {}

  list = (_req: Request, res: Response) => {
    res.json({ mappings: this.midiMappings.list() });
  };

  create = (req: Request, res: Response) => {
    const mapping = this.midiMappings.create(req.body);
    res.status(201).json({ mapping });
  };

  remove = (req: Request, res: Response) => {
    this.midiMappings.delete(parseId(req.params.id));
    res.status(204).send();
  };
}
