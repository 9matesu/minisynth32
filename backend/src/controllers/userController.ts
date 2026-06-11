import type { Request, Response } from 'express';
import type { UserService } from '../services/user/UserService.js';

export class UserController {
  constructor(private userService: UserService) {}

  public getUser = (req: Request, res: Response): void => {
    try {
      // Hardcoded ID 1 since it's a single user local application
      const user = this.userService.getUser(1);
      res.json(user);
    } catch (error) {
      console.error('[UserController] Failed to get user', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public updateUser = (req: Request, res: Response): void => {
    try {
      const { xp, completedTasks, settings } = req.body;
      const user = this.userService.updateUser(1, { xp, completedTasks, settings });
      res.json(user);
    } catch (error) {
      console.error('[UserController] Failed to update user', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
