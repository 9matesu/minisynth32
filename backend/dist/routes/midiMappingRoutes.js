import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
export const createMidiMappingRoutes = (controller) => {
    const router = Router();
    router.get('/midi-mappings', asyncHandler(controller.list));
    router.post('/midi-mappings', asyncHandler(controller.create));
    router.delete('/midi-mappings/:id', asyncHandler(controller.remove));
    return router;
};
//# sourceMappingURL=midiMappingRoutes.js.map