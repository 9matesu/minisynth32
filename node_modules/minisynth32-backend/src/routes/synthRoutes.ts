import { Router } from 'express';
import type { SynthController } from '../controllers/synthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createSynthRoutes = (controller: SynthController) => {
  const router = Router();
  router.get('/synth/state', asyncHandler(controller.show));
  router.post('/synth/param', asyncHandler(controller.setParam));
  return router;
};
