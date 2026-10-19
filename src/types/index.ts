export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface FileItem {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // mime type
  category: FileCategory;
  folderId: string | null; // null means root
  storagePath: string;
  url: string; // Blob URL, object URL, or Supabase public/signed URL
  thumbnailUrl?: string;
  isFavorite: boolean;
  isTrash: boolean;
  trashDate?: string;
  dimensions?: { width: number; height: number };
  duration?: number; // for audio/video in seconds
  hash?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  description?: string;
  tags?: string[];
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null; // null means root
  color?: string; // hex or tailwind color name
  isFavorite: boolean;
  isTrash: boolean;
  trashDate?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface AlbumItem {
  id: string;
  name: string;
  description?: string;
  coverImageId?: string;
  fileIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShareLink {
  id: string;
  fileId: string;
  token: string;
  expiresAt: string | null;
  hasPassword: boolean;
  password?: string;
  viewsCount: number;
  downloadsCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  action: 'upload' | 'delete' | 'restore' | 'move' | 'favorite' | 'download' | 'share' | 'create_folder';
  targetName: string;
  targetType: 'file' | 'folder' | 'album';
  timestamp: string;
  details?: string;
}

export interface StorageStats {
  usedBytes: number;
  totalQuotaBytes: number;
  categories: {
    category: FileCategory;
    name: string;
    bytes: number;
    count: number;
    color: string;
  }[];
}

export interface UploadProgressItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number; // 0 - 100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  targetFolderId: string | null;
}

export type ViewMode = 'grid' | 'list';

export type ActiveSection = 
  | 'dashboard' 
  | 'files' 
  | 'photos' 
  | 'albums' 
  | 'favorites' 
  | 'recent' 
  | 'trash' 
  | 'storage';

export type SortField = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  storageQuotaBytes: number;
}
