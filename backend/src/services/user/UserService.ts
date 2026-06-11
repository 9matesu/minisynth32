import type { User } from '../../db/models/user.js';
import type { UserRepository } from '../../db/repositories/UserRepository.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  public getUser(id: number = 1): User {
    const user = this.userRepository.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  public updateUser(
    id: number,
    data: { xp?: number; completedTasks?: string[]; settings?: Record<string, any> }
  ): User {
    this.userRepository.updateUser(id, data);
    return this.getUser(id);
  }
}
