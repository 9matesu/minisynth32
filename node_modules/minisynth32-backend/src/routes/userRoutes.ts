import { Router } from 'express';
import type { UserController } from '../controllers/userController.js';

export const createUserRoutes = (controller: UserController) => {
  const router = Router();
  
  router.get('/user', controller.getUser);
  router.put('/user', controller.updateUser);

  return router;
};
