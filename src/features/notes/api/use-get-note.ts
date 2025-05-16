import { useQuery } from 'convex/react';
import { useMemo, useState, useEffect } from 'react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import type { Note } from '../types/index';

export const useGetNote = (noteId?: Id<'notes'>) => {
	// Check if the noteId is a temporary ID (starts with "temp-")
	const isTempId = noteId ? noteId.toString().startsWith('temp-') : false;

	// Only query Convex if we have a valid (non-temporary) ID
	const note = useQuery(
		api.notes.getById,
		noteId && !isTempId ? { noteId } : 'skip'
	);

	// For temporary notes, we'll use local state
	const [tempNote, setTempNote] = useState<Note | undefined>(undefined);

	// When the noteId changes and it's a temporary ID, create a placeholder note
	useEffect(() => {
		if (noteId && isTempId) {
			// Create a placeholder note for the UI
			setTempNote({
				_id: noteId,
				title: 'Untitled',
				content: JSON.stringify({ ops: [{ insert: '\n' }] }),
				workspaceId: undefined,
				channelId: undefined,
				folderId: undefined,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			} as Note);

			console.log('Created temporary note in useGetNote:', noteId);
		} else {
			// Clear the temp note when we switch to a real note
			setTempNote(undefined);
		}
	}, [noteId, isTempId]);

	// Use either the real note from Convex or our temporary note
	const data = useMemo(() => {
		if (isTempId) {
			return tempNote;
		}
		return note as Note | undefined;
	}, [note, tempNote, isTempId]);

	// We're loading if we're waiting for a non-temp note and don't have it yet
	const isLoading = useMemo(
		() => !isTempId && noteId && note === undefined,
		[note, noteId, isTempId]
	);

	return {
		data,
		isLoading,
	};
};
