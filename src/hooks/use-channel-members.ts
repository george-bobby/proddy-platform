'use client';

import { useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

export const useChannelMembers = (
  workspaceId: Id<'workspaces'>,
  channelId: Id<'channels'>
) => {
  // Get all members of the workspace
  const members = useQuery(api.members.get, { workspaceId });

  // Get the current user's member info
  const currentMember = useQuery(api.members.current, { workspaceId });

  // Get all user statuses for the workspace
  const statuses = useQuery(api.status.getForWorkspace, { workspaceId });

  // Check if data is still loading
  const isLoading = members === undefined || currentMember === undefined || statuses === undefined;

  // Return early if data is still loading
  if (isLoading) {
    return { members: [], currentMember: null, isLoading: true };
  }

  // Create a stable reference to the status map
  const statusMap: Record<string, string> = {};

  // Only process statuses if they exist
  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      statusMap[status.userId] = status.status;
    }
  }

  // Format members with their status - only if members exist
  const formattedMembers = members ? members.map(member => ({
    ...member,
    status: statusMap[member.user?._id] || 'offline'
  })) : [];

  // Return the processed data
  return {
    members: formattedMembers,
    currentMember,
    isLoading: false
  };
};
