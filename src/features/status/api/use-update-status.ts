import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

type RequestType = {
  status: string;
  workspaceId: Id<'workspaces'>;
};

type ResponseType = { success: boolean };

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useUpdateStatus = () => {
  const updateStatus = useMutation(api.status.update);
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (request: RequestType, options?: Options) => {
      try {
        setIsPending(true);
        const response = await updateStatus(request);

        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        const err = error as Error;
        options?.onError?.(err);

        if (options?.throwError) {
          throw err;
        }

        return null;
      } finally {
        setIsPending(false);
        options?.onSettled?.();
      }
    },
    [updateStatus]
  );

  return {
    updateStatus: execute,
    isPending,
  };
};
