import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
export const createHealthRoutes = (controller) => {
    const router = Router();
    router.get('/health', asyncHandler(controller.show));
    return router;
};
//# sourceMappingURL=healthRoutes.js.map