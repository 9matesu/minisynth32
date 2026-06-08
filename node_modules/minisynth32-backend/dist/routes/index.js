import { Router } from 'express';
import { createHealthRoutes } from './healthRoutes.js';
import { createMidiMappingRoutes } from './midiMappingRoutes.js';
import { createPresetRoutes } from './presetRoutes.js';
import { createSynthRoutes } from './synthRoutes.js';
export const createApiRouter = (controllers) => {
    const router = Router();
    router.use(createHealthRoutes(controllers.health));
    router.use(createPresetRoutes(controllers.presets));
    router.use(createMidiMappingRoutes(controllers.midiMappings));
    router.use(createSynthRoutes(controllers.synth));
    return router;
};
//# sourceMappingURL=index.js.map