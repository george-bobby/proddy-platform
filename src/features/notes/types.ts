import { Id } from '@/../convex/_generated/dataModel';

export interface Note {
  _id: Id<'notes'>;
  _creationTime: number;
  title: string;
  content: string;
  memberId: Id<'members'>;
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
  folderId?: Id<'noteFolders'>;
  coverImage?: Id<'_storage'>;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NoteFolder {
  _id: Id<'noteFolders'>;
  _creationTime: number;
  name: string;
  memberId: Id<'members'>;
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
  parentFolderId?: Id<'noteFolders'>;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FolderWithNotes extends NoteFolder {
  notes: Note[];
  subfolders: FolderWithNotes[];
}

export interface FolderTreeItem {
  folder: NoteFolder;
  notes: Note[];
  subfolders: FolderTreeItem[];
  isOpen: boolean;
}
