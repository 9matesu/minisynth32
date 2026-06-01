import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
export const createPresetRoutes = (controller) => {
    const router = Router();
    router.get('/presets', asyncHandler(controller.list));
    router.get('/presets/:id', asyncHandler(controller.show));
    router.post('/presets', asyncHandler(controller.create));
    router.put('/presets/:id', asyncHandler(controller.update));
    router.delete('/presets/:id', asyncHandler(controller.remove));
    router.post('/presets/:id/load', asyncHandler(controller.load));
    return router;
};
//# sourceMappingURL=presetRoutes.js.map