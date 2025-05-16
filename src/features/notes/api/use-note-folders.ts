import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { toast } from 'sonner';
import { NoteFolder } from '../types';

// Hook to get all folders for a channel
export const useGetNoteFolders = (
	workspaceId?: Id<'workspaces'>,
	channelId?: Id<'channels'>
): { data: NoteFolder[] | undefined; isLoading: boolean } => {
	return useQuery(
		api.noteFolders.list,
		workspaceId && channelId ? { workspaceId, channelId } : 'skip'
	);
};

// Hook to create a new folder
export const useCreateNoteFolder = () => {
	const createFolder = useMutation(api.noteFolders.create);

	const mutate = async ({
		name,
		workspaceId,
		channelId,
		parentFolderId,
		icon,
	}: {
		name: string;
		workspaceId: Id<'workspaces'>;
		channelId: Id<'channels'>;
		parentFolderId?: Id<'noteFolders'>;
		icon?: string;
	}) => {
		try {
			const folderId = await createFolder({
				name,
				workspaceId,
				channelId,
				parentFolderId,
				icon,
			});
			return folderId;
		} catch (error) {
			console.error('Failed to create folder:', error);
			toast.error('Failed to create folder');
			throw error;
		}
	};

	return { mutate };
};

// Hook to update a folder
export const useUpdateNoteFolder = () => {
	const updateFolder = useMutation(api.noteFolders.update);

	const mutate = async ({
		id,
		name,
		parentFolderId,
		icon,
	}: {
		id: Id<'noteFolders'>;
		name?: string;
		parentFolderId?: Id<'noteFolders'>;
		icon?: string;
	}) => {
		try {
			const folderId = await updateFolder({
				id,
				name,
				parentFolderId,
				icon,
			});
			return folderId;
		} catch (error) {
			console.error('Failed to update folder:', error);
			toast.error('Failed to update folder');
			throw error;
		}
	};

	return { mutate };
};

// Hook to delete a folder
export const useDeleteNoteFolder = () => {
	const deleteFolder = useMutation(api.noteFolders.remove);

	const mutate = async (
		id: Id<'noteFolders'> | string | { id: Id<'noteFolders'> }
	) => {
		try {
			console.log('Deleting folder with ID:', id);

			// Make sure we're passing an object with an id property
			let idObj: { id: Id<'noteFolders'> };

			if (typeof id === 'object' && 'id' in id) {
				// Already in the correct format
				idObj = id as { id: Id<'noteFolders'> };
			} else {
				// Convert string or Id to object format
				idObj = { id: id as Id<'noteFolders'> };
			}

			const folderId = await deleteFolder(idObj);
			console.log('Folder deleted successfully:', folderId);
			toast.success('Folder deleted successfully');
			return folderId;
		} catch (error) {
			console.error('Failed to delete folder:', error);
			toast.error(
				'Failed to delete folder: ' +
					(error instanceof Error ? error.message : String(error))
			);
			throw error;
		}
	};

	return { mutate };
};

// Hook to get notes by folder
export const useGetNotesByFolder = (folderId?: Id<'noteFolders'>) => {
	return useQuery(api.notes.getByFolder, folderId ? { folderId } : 'skip');
};

// Hook to move a note to a folder
export const useMoveNoteToFolder = () => {
	const updateNote = useMutation(api.notes.update);

	const mutate = async ({
		noteId,
		folderId,
	}: {
		noteId: Id<'notes'>;
		folderId?: Id<'noteFolders'>;
	}) => {
		try {
			await updateNote({
				id: noteId,
				folderId,
			});
			return true;
		} catch (error) {
			console.error('Failed to move note:', error);
			toast.error('Failed to move note');
			throw error;
		}
	};

	return { mutate };
};
