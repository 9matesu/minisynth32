export interface User {
  id: number;
  username: string;
  xp: number;
  completedTasks: string[]; // Parsed from JSON
  settings: Record<string, any>; // Parsed from JSON
  createdAt: string;
  updatedAt: string;
}
