import type { Database } from 'better-sqlite3';
import type { User } from '../models/user.js';

export class UserRepository {
  constructor(private db: Database) {}

  public getUser(id: number = 1): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      xp: row.xp,
      completedTasks: JSON.parse(row.completed_tasks || '[]'),
      settings: JSON.parse(row.settings || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public updateUser(
    id: number,
    data: { xp?: number; completedTasks?: string[]; settings?: Record<string, any> }
  ): void {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.xp !== undefined) {
      updates.push('xp = ?');
      values.push(data.xp);
    }
    if (data.completedTasks !== undefined) {
      updates.push('completed_tasks = ?');
      values.push(JSON.stringify(data.completedTasks));
    }
    if (data.settings !== undefined) {
      updates.push('settings = ?');
      values.push(JSON.stringify(data.settings));
    }

    if (updates.length === 0) return;

    updates.push("updated_at = datetime('now')");
    values.push(id);

    const stmt = this.db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  }
}
