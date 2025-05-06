'use client';

import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useChannelId } from './use-channel-id';
import { useWorkspaceId } from './use-workspace-id';

import { useOthers, useSelf, useRoom } from '../../liveblocks.config';

export const useChannelParticipants = () => {
  // Get channel and workspace IDs from the URL
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const room = useRoom();

  // State to track actual participants count
  const [participantCount, setParticipantCount] = useState(0);

  // Fetch members from the database
  const members = useQuery(api.members.get, { workspaceId });

  // Get the current user's member info
  const currentMember = useQuery(api.members.current, { workspaceId });

  // Get all user statuses for the workspace
  const statuses = useQuery(api.status.getForWorkspace, { workspaceId });

  // Get Liveblocks participants (users currently in the canvas)
  const others = useOthers();
  const self = useSelf();

  // Check if data is still loading
  const isLoading = members === undefined || currentMember === undefined || statuses === undefined;

  // Create a map of Convex users by their ID for quick lookup
  const userMap = new Map();
  if (members) {
    members.forEach(member => {
      userMap.set(member.user._id, member);
    });
  }

  // Update participant count whenever others or self changes
  useEffect(() => {
    // Count is others plus self (if present)
    const count = others.count + (self ? 1 : 0);

    // Ensure we have a valid number
    const validCount = isNaN(count) ? 0 : count;
    setParticipantCount(validCount);

    console.log(`Canvas participants: ${validCount} users in room ${room.id}`);

    // Log all participants for debugging
    others.forEach(other => {
      console.log(`Other participant: ${other.connectionId}`,
        other.info?.id ? `User ID: ${other.info.id}` : 'No user ID',
        other.info?.name ? `Name: ${other.info.name}` : 'No name');
    });

    if (self) {
      console.log(`Self participant:`,
        self.info?.id ? `User ID: ${self.info.id}` : 'No user ID',
        self.info?.name ? `Name: ${self.info.name}` : 'No name');
    }
  }, [others, self, room.id]);

  if (isLoading) {
    return {
      participants: [],
      currentParticipant: null,
      participantCount: 0,
      isLoading: true
    };
  }

  // Create a status map for quick lookup
  const statusMap: Record<string, string> = {};
  if (statuses) {
    for (const status of statuses) {
      statusMap[status.userId] = status.status;
    }
  }

  // Create a map of users currently in the canvas room
  const canvasParticipantIds = new Set<string>();

  // Add other users in the canvas
  others.forEach(other => {
    if (other.info?.id) {
      canvasParticipantIds.add(other.info.id);
    }
  });

  // Add current user if they're in the canvas
  if (self?.info?.id) {
    canvasParticipantIds.add(self.info.id);
  }

  // Map Liveblocks connection IDs to user IDs for accurate tracking
  const connectionToUserIdMap = new Map();
  others.forEach(other => {
    if (other.info?.id) {
      connectionToUserIdMap.set(other.connectionId, other.info.id);
    }
  });

  // Filter for online members who are in the canvas
  const canvasMembers = members?.filter(member =>
    statusMap[member.user._id] === 'online' &&
    canvasParticipantIds.has(member.user._id)
  ) || [];

  // Format participants with their user info
  const participants = others.map(other => {
    const userId = other.info?.id;
    let member = userId ? userMap.get(userId) : null;

    // If no exact match by ID, try to find a partial match
    if (!member && userId && typeof userId === 'string' && members) {
      const matchingMember = members.find(m =>
        m.user._id.includes(userId) || userId.includes(m.user._id)
      );

      if (matchingMember) {
        member = matchingMember;
        console.log("Found member by partial ID match:", matchingMember.user.name);
      }
    }

    // If still no match and we have members, try to assign a member based on connection ID
    if (!member && members && members.length > 0) {
      // Use modulo to cycle through available members
      const memberByIndex = members[other.connectionId % members.length];
      if (memberByIndex) {
        member = memberByIndex;
        console.log("Assigned member by connection ID:", memberByIndex.user.name);
      }
    }

    return {
      connectionId: other.connectionId,
      memberId: member?._id || null,
      userId: userId || null,
      info: {
        name: member?.user?.name || other.info?.name || `User ${other.connectionId}`,
        picture: member?.user?.image || other.info?.picture ||
          `https://via.placeholder.com/40/4f46e5/ffffff?text=${(member?.user?.name?.[0] || other.info?.name?.[0] || 'U').toUpperCase()}`
      }
    };
  });

  // Get current participant
  const currentParticipant = currentMember && self ? {
    connectionId: self.connectionId,
    memberId: currentMember._id,
    userId: currentMember.userId,
    info: {
      // Find the current member in the members list to get their name
      name: members?.find(m => m._id === currentMember._id)?.user?.name || "You",
      picture: members?.find(m => m._id === currentMember._id)?.user?.image ||
        `https://via.placeholder.com/40/4f46e5/ffffff?text=Y`
    }
  } : null;

  return {
    participants,
    currentParticipant,
    participantCount,
    isLoading: false
  };
};
