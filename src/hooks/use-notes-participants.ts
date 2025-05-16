'use client';

import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { api } from '@/../convex/_generated/api';
import { useWorkspaceId } from './use-workspace-id';
import { useOthers, useSelf, useRoom } from '@/../liveblocks.config';

export const useNotesParticipants = () => {
	// Get workspace ID from the URL
	const workspaceId = useWorkspaceId();
	const room = useRoom();

	// State to track actual participants count
	const [participantCount, setParticipantCount] = useState(0);

	// Fetch members from the database
	const members = useQuery(api.members.get, { workspaceId });

	// Get the current user's member info
	const currentMember = useQuery(api.members.current, { workspaceId });

	// Get Liveblocks participants (users currently in the note)
	const others = useOthers();
	const self = useSelf();

	// Check if data is still loading
	const isLoading = members === undefined || currentMember === undefined;

	// Update participant count whenever others or self changes
	useEffect(() => {
		// Count is others plus self (if present)
		const count = others.length + (self ? 1 : 0);
		setParticipantCount(count);

		console.log(`Notes participants: ${count} users in room ${room.id}`);

		// Log all participants for debugging
		others.forEach((other) => {
			console.log(
				`Other participant: ${other.connectionId}`,
				other.id ? `User ID: ${other.id}` : 'No user ID',
				other.info?.name ? `Name: ${other.info.name}` : 'No name'
			);
		});

		if (self) {
			console.log(
				`Self participant:`,
				self.id ? `User ID: ${self.id}` : 'No user ID',
				self.info?.name ? `Name: ${self.info.name}` : 'No name'
			);
		}
	}, [others, self, room.id]);

	if (isLoading) {
		return {
			participants: [],
			currentParticipant: null,
			participantCount: 0,
			isLoading: true,
		};
	}

	// Create a map of Convex users by their ID for quick lookup
	const userMap = new Map();
	if (members) {
		members.forEach((member) => {
			userMap.set(member.user._id, member);
		});
	}

	// Format participants with their user info - DIRECT DATABASE APPROACH
	const participants = others.map((other) => {
		const userId = other.id;
		let member = null;
		let userName = null;
		let userPicture = null;

		// DIRECT DATABASE APPROACH: Always try to get the actual user name from the database first
		if (userId && members) {
			// Try exact match first - this is the most reliable approach
			const exactMatch = members.find((m) => m.user._id === userId);
			if (exactMatch && exactMatch.user) {
				member = exactMatch;
				userName = exactMatch.user.name;
				userPicture = exactMatch.user.image;
				console.log('DIRECT DB: Found exact user name match:', userName);
			} else if (typeof userId === 'string') {
				// Try partial match if exact match fails
				const partialMatch = members.find(
					(m) => m.user._id.includes(userId) || userId.includes(m.user._id)
				);
				if (partialMatch && partialMatch.user) {
					member = partialMatch;
					userName = partialMatch.user.name;
					userPicture = partialMatch.user.image;
					console.log('DIRECT DB: Found partial user name match:', userName);
				}
			}
		}

		// If we couldn't find the user in the database but have info from Liveblocks, use that
		if (!userName && other.info?.name) {
			userName = other.info.name;
			userPicture = other.info.picture;
			console.log('Using name from Liveblocks info:', userName);
		}

		// Final fallback
		if (!userName) {
			userName = `User ${other.connectionId}`;
			console.log('Using fallback name:', userName);
		}

		// Generate avatar fallback
		const avatarFallback = userName ? userName[0].toUpperCase() : 'U';
		const fallbackPicture = `https://via.placeholder.com/40/4f46e5/ffffff?text=${avatarFallback}`;

		return {
			connectionId: other.connectionId,
			memberId: member?._id || null,
			userId: userId || null,
			info: {
				name: userName,
				picture: userPicture || fallbackPicture,
			},
		};
	});

	// Get current participant - DIRECT DATABASE APPROACH
	const currentParticipant =
		currentMember && self
			? {
					connectionId: self.connectionId,
					memberId: currentMember._id,
					userId: currentMember.userId,
					info: {
						// DIRECT DATABASE APPROACH: Always get the current user's name from the database
						name:
							members?.find((m) => m._id === currentMember._id)?.user?.name ||
							members?.find((m) => m.userId === currentMember.userId)?.user
								?.name ||
							'You',
						picture:
							members?.find((m) => m._id === currentMember._id)?.user?.image ||
							members?.find((m) => m.userId === currentMember.userId)?.user
								?.image ||
							`https://via.placeholder.com/40/4f46e5/ffffff?text=Y`,
					},
				}
			: null;

	return {
		participants,
		currentParticipant,
		participantCount,
		isLoading: false,
	};
};
