import { Router } from 'express';
import type { MidiMappingController } from '../controllers/midiMappingController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createMidiMappingRoutes = (controller: MidiMappingController) => {
  const router = Router();
  router.get('/midi-mappings', asyncHandler(controller.list));
  router.post('/midi-mappings', asyncHandler(controller.create));
  router.delete('/midi-mappings/:id', asyncHandler(controller.remove));
  return router;
};
