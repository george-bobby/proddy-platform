import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';

import { api } from '@/../convex/_generated/api';

type ResponseType = { success: boolean };

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useMarkOfflineGlobally = () => {
  const markOfflineGlobally = useMutation(api.status.markUserOfflineGlobally);
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (options?: Options) => {
      try {
        setIsPending(true);
        const response = await markOfflineGlobally();

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
    [markOfflineGlobally]
  );

  return {
    markOfflineGlobally: execute,
    isPending,
  };
};
