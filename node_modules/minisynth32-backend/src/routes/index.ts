import { Router } from 'express';
import type { HealthController } from '../controllers/healthController.js';
import type { MidiMappingController } from '../controllers/midiMappingController.js';
import type { PresetController } from '../controllers/presetController.js';
import type { SynthController } from '../controllers/synthController.js';
import type { UserController } from '../controllers/userController.js';
import { createHealthRoutes } from './healthRoutes.js';
import { createMidiMappingRoutes } from './midiMappingRoutes.js';
import { createPresetRoutes } from './presetRoutes.js';
import { createSynthRoutes } from './synthRoutes.js';
import { createUserRoutes } from './userRoutes.js';

export interface RouteControllers {
  health: HealthController;
  presets: PresetController;
  midiMappings: MidiMappingController;
  synth: SynthController;
  user: UserController;
}

export const createApiRouter = (controllers: RouteControllers) => {
  const router = Router();
  router.use(createHealthRoutes(controllers.health));
  router.use(createPresetRoutes(controllers.presets));
  router.use(createMidiMappingRoutes(controllers.midiMappings));
  router.use(createSynthRoutes(controllers.synth));
  router.use(createUserRoutes(controllers.user));
  return router;
};
