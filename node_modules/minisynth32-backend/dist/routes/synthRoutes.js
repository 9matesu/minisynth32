import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
export const createSynthRoutes = (controller) => {
    const router = Router();
    router.get('/synth/state', asyncHandler(controller.show));
    router.post('/synth/param', asyncHandler(controller.setParam));
    return router;
};
//# sourceMappingURL=synthRoutes.js.map