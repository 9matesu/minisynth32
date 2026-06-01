import { Router } from 'express';
import type { HealthController } from '../controllers/healthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createHealthRoutes = (controller: HealthController) => {
  const router = Router();
  router.get('/health', asyncHandler(controller.show));
  return router;
};
