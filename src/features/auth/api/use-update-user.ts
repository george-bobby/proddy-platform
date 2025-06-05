import { useMutation } from 'convex/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { api } from '@/../convex/_generated/api';

interface UpdateUserData {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
}

export const useUpdateUser = () => {
  const updateUserMutation = useMutation(api.users.updateProfile);

  const updateUser = useCallback(
    async (data: UpdateUserData) => {
      try {
        await updateUserMutation(data);
        return { success: true };
      } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
      }
    },
    [updateUserMutation]
  );

  return {
    updateUser,
    isLoading: false, // The mutation handles its own loading state
  };
};
