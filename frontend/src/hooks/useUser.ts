import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types.js';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data: { xp?: number; completedTasks?: string[]; settings?: Record<string, any> }) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updated = await response.json();
        setUser(updated);
        return updated;
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, updateUser, refetch: fetchUser };
}
