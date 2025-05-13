'use client';

import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal';

const WorkspacePage = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();
  const { data, isLoading } = useGetWorkspaces();

  useEffect(() => {
    if (isLoading) return;

    if (data?.length) {
      // If user has workspaces, redirect to the first one
      router.replace(`/workspace/${data[0]._id}`);
    } else if (!open) {
      // If user has no workspaces, open the create workspace modal
      setOpen(true);
    }
  }, [data, isLoading, open, setOpen, router]);

  return (
    <div className="bg-primary flex h-full flex-1 flex-col items-center justify-center gap-2 text-white">
      <Loader className="size-5 animate-spin" />
      <p className="text-sm">Loading your workspace...</p>
    </div>
  );
};

export default WorkspacePage;
