import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UserSync() {
  const { user } = useAuth();

  useEffect(() => {
    async function syncUser() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Failed to sync user to SQL');
        }
      } catch (error) {
        console.error('User sync error:', error);
      }
    }

    syncUser();
  }, [user]);

  return null;
}
