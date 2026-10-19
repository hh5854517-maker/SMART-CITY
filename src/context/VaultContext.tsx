import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  FileItem,
  FolderItem,
  AlbumItem,
  ActivityItem,
  StorageStats,
  UploadProgressItem,
  ActiveSection,
  ViewMode,
  SortConfig,
  FileCategory,
  UserProfile,
} from '../types';
import { INITIAL_FILES, INITIAL_FOLDERS, INITIAL_ALBUMS, INITIAL_ACTIVITIES } from '../lib/seedData';
import { getFileCategory, downloadMultipleAsZip } from '../lib/utils';
import { getSupabase, getSupabaseConfig, resetSupabaseClient } from '../lib/supabase';

interface VaultContextType {
  // User & Mode
  user: UserProfile | null;
  isSupabaseConfigured: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data
  files: FileItem[];
  folders: FolderItem[];
  albums: AlbumItem[];
  activities: ActivityItem[];
  storageStats: StorageStats;

  // Navigation & View
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  folderBreadcrumbs: FolderItem[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Search, Filter, Sort
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  typeFilter: FileCategory | 'all';
  setTypeFilter: (cat: FileCategory | 'all') => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;

  // Selection
  selectedFileIds: Set<string>;
  toggleFileSelection: (id: string) => void;
  selectAllFiles: (ids: string[]) => void;
  clearSelection: () => void;

  // File Operations
  uploadFiles: (filesList: FileList | File[], targetFolderId?: string | null) => Promise<void>;
  uploadQueue: UploadProgressItem[];
  clearCompletedUploads: () => void;
  deleteFile: (id: string, permanent?: boolean) => void;
  restoreFile: (id: string) => void;
  toggleFavoriteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  moveFile: (id: string, newFolderId: string | null) => void;
  batchDelete: (ids: string[], permanent?: boolean) => void;
  batchMove: (ids: string[], targetFolderId: string | null) => void;
  batchFavorite: (ids: string[], fav: boolean) => void;
  batchDownloadZip: (ids: string[]) => Promise<void>;

  // Folder Operations
  createFolder: (name: string, color?: string, parentId?: string | null) => void;
  renameFolder: (id: string, newName: string) => void;
  deleteFolder: (id: string, permanent?: boolean) => void;
  moveFolder: (id: string, newParentId: string | null) => void;

  // Album Operations
  createAlbum: (name: string, description?: string, fileIds?: string[]) => void;
  addFilesToAlbum: (albumId: string, fileIds: string[]) => void;
  removeFileFromAlbum: (albumId: string, fileId: string) => void;
  deleteAlbum: (albumId: string) => void;

  // Trash Operations
  emptyTrash: () => void;
  restoreAllTrash: () => void;

  // Modals & UI Controls
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isCreateFolderModalOpen: boolean;
  setIsCreateFolderModalOpen: (open: boolean) => void;
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (open: boolean) => void;
  renameTarget: { id: string; name: string; type: 'file' | 'folder' } | null;
  openRenameModal: (id: string, name: string, type: 'file' | 'folder') => void;
  isMoveModalOpen: boolean;
  setIsMoveModalOpen: (open: boolean) => void;
  moveTarget: { id: string; name: string; type: 'file' | 'folder' } | null;
  openMoveModal: (id: string, name: string, type: 'file' | 'folder') => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  shareTargetFile: FileItem | null;
  openShareModal: (file: FileItem) => void;
  isCreateAlbumModalOpen: boolean;
  setIsCreateAlbumModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Preview Modal
  activePreviewFile: FileItem | null;
  openPreview: (file: FileItem) => void;
  closePreview: () => void;
  navigatePreview: (direction: 'next' | 'prev') => void;

  // Auth Operations
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  configureSupabase: (url: string, key: string) => void;
  resetAllData: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'usr-demo-001',
  email: 'alex.morgan@filevault.io',
  fullName: 'Alex Morgan',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  storageQuotaBytes: 5 * 1024 * 1024 * 1024, // 5 GB
};

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('filevault_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('filevault_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Supabase status
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(() => {
    return getSupabaseConfig().isConfigured;
  });

  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('filevault_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  // Files & Folders & Albums & Activities
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('filevault_files');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [folders, setFolders] = useState<FolderItem[]>(() => {
    const saved = localStorage.getItem('filevault_folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [albums, setAlbums] = useState<AlbumItem[]>(() => {
    const saved = localStorage.getItem('filevault_albums');
    return saved ? JSON.parse(saved) : INITIAL_ALBUMS;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('filevault_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Persist local changes
  useEffect(() => {
    localStorage.setItem('filevault_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('filevault_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('filevault_albums', JSON.stringify(albums));
  }, [albums]);

  useEffect(() => {
    localStorage.setItem('filevault_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('filevault_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('filevault_user');
    }
  }, [user]);

  // Navigation & View
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileCategory | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', order: 'desc' });

  // Multi-Selection
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Upload Queue
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetFile, setShareTargetFile] = useState<FileItem | null>(null);
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // File Preview Modal
  const [activePreviewFile, setActivePreviewFile] = useState<FileItem | null>(null);

  // Sync with Supabase on load if configured
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Check existing auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          avatarUrl: session.user.user_metadata?.avatar_url || '',
          storageQuotaBytes: 5 * 1024 * 1024 * 1024,
        });

        // Load files from Supabase
        supabase.from('files').select('*').eq('user_id', session.user.id).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setFiles(data.map((f: any) => ({
              id: f.id,
              name: f.name,
              size: f.size,
              type: f.type,
              category: f.category,
              folderId: f.folder_id,
              storagePath: f.storage_path,
              url: f.thumbnail_url || '',
              thumbnailUrl: f.thumbnail_url,
              isFavorite: f.is_favorite,
              isTrash: f.is_trash,
              trashDate: f.trash_date,
              dimensions: f.width && f.height ? { width: f.width, height: f.height } : undefined,
              duration: f.duration,
              hash: f.hash,
              createdAt: f.created_at,
              updatedAt: f.updated_at,
              userId: f.user_id,
            })));
          }
        });

        // Load folders from Supabase
        supabase.from('folders').select('*').eq('user_id', session.user.id).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setFolders(data.map((fd: any) => ({
              id: fd.id,
              name: fd.name,
              parentId: fd.parent_id,
              color: fd.color,
              isFavorite: fd.is_favorite,
              isTrash: fd.is_trash,
              trashDate: fd.trash_date,
              createdAt: fd.created_at,
              updatedAt: fd.updated_at,
              userId: fd.user_id,
            })));
          }
        });
      }
    });
  }, [isSupabaseConfigured]);

  // Compute folder breadcrumbs
  const folderBreadcrumbs = useMemo(() => {
    const crumbs: FolderItem[] = [];
    let currentId = activeFolderId;
    while (currentId) {
      const folder = folders.find(f => f.id === currentId && !f.isTrash);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  }, [activeFolderId, folders]);

  // Storage calculation
  const storageStats = useMemo<StorageStats>(() => {
    const activeFiles = files.filter(f => !f.isTrash);
    const usedBytes = activeFiles.reduce((acc, f) => acc + f.size, 0);
    const totalQuotaBytes = user?.storageQuotaBytes || 5 * 1024 * 1024 * 1024;

    const catMap: Record<FileCategory, { bytes: number; count: number; name: string; color: string }> = {
      image: { bytes: 0, count: 0, name: 'Images & Photos', color: '#6366f1' },
      video: { bytes: 0, count: 0, name: 'Videos', color: '#ec4899' },
      document: { bytes: 0, count: 0, name: 'Documents', color: '#3b82f6' },
      audio: { bytes: 0, count: 0, name: 'Audio & Music', color: '#f59e0b' },
      archive: { bytes: 0, count: 0, name: 'Archives & Zips', color: '#8b5cf6' },
      other: { bytes: 0, count: 0, name: 'Other Files', color: '#64748b' },
    };

    activeFiles.forEach(f => {
      const cat = f.category in catMap ? f.category : 'other';
      catMap[cat].bytes += f.size;
      catMap[cat].count += 1;
    });

    return {
      usedBytes,
      totalQuotaBytes,
      categories: (Object.keys(catMap) as FileCategory[]).map(cat => ({
        category: cat,
        name: catMap[cat].name,
        bytes: catMap[cat].bytes,
        count: catMap[cat].count,
        color: catMap[cat].color,
      })),
    };
  }, [files, user]);

  // Selection handlers
  const toggleFileSelection = useCallback((id: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiles = useCallback((ids: string[]) => {
    setSelectedFileIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFileIds(new Set());
  }, []);

  // Log activity helper
  const addActivity = useCallback((
    action: ActivityItem['action'],
    targetName: string,
    targetType: ActivityItem['targetType'],
    details?: string
  ) => {
    const newAct: ActivityItem = {
      id: 'act-' + Date.now() + Math.random().toString(36).substring(2, 6),
      action,
      targetName,
      targetType,
      timestamp: new Date().toISOString(),
      details,
    };
    setActivities(prev => [newAct, ...prev.slice(0, 49)]);
  }, []);

  // Upload Files implementation
  const uploadFiles = useCallback(async (filesList: FileList | File[], targetFolderId: string | null = activeFolderId) => {
    const newItems: UploadProgressItem[] = Array.from(filesList).map(file => ({
      id: 'up-' + Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      progress: 0,
      status: 'pending',
      targetFolderId,
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    setIsUploadModalOpen(true);

    const supabase = getSupabase();

    for (const item of newItems) {
      setUploadQueue(prev =>
        prev.map(p => (p.id === item.id ? { ...p, status: 'uploading', progress: 15 } : p))
      );

      // Quota check
      if (storageStats.usedBytes + item.size > storageStats.totalQuotaBytes) {
        setUploadQueue(prev =>
          prev.map(p => (p.id === item.id ? { ...p, status: 'error', error: 'Storage quota exceeded (5 GB limit)' } : p))
        );
        continue;
      }

      try {
        let finalUrl = '';
        let storagePath = `uploads/${Date.now()}_${item.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        if (supabase && user) {
          // Real Supabase Storage upload
          const userStoragePath = `${user.id}/${storagePath}`;
          const { error: uploadErr } = await supabase.storage
            .from('filevault')
            .upload(userStoragePath, item.file, { upsert: true });

          if (uploadErr) {
            console.warn('Supabase storage upload error, falling back to local object URL:', uploadErr.message);
            finalUrl = URL.createObjectURL(item.file);
          } else {
            // Get public or signed URL
            const { data: urlData } = supabase.storage
              .from('filevault')
              .getPublicUrl(userStoragePath);
            finalUrl = urlData.publicUrl;
          }
        } else {
          // Local/Demo Mode: create object URL
          finalUrl = URL.createObjectURL(item.file);
        }

        // Simulate smooth progress ticks
        setUploadQueue(prev =>
          prev.map(p => (p.id === item.id ? { ...p, progress: 65 } : p))
        );

        await new Promise(r => setTimeout(r, 400));

        const category = getFileCategory(item.type, item.name);

        // Compute dimensions if image
        let dimensions: { width: number; height: number } | undefined;
        if (category === 'image') {
          try {
            const img = new Image();
            img.src = finalUrl;
            await new Promise((resolve) => {
              img.onload = () => {
                dimensions = { width: img.naturalWidth, height: img.naturalHeight };
                resolve(null);
              };
              img.onerror = () => resolve(null);
            });
          } catch {
            // ignore
          }
        }

        // Read text preview if markdown or text
        let description: string | undefined;
        if (item.type.includes('text') || item.name.endsWith('.md') || item.name.endsWith('.txt')) {
          try {
            description = await item.file.text();
          } catch {
            // ignore
          }
        }

        // Handle duplicate names: append suffix
        let finalName = item.name;
        let counter = 1;
        while (files.some(f => f.name.toLowerCase() === finalName.toLowerCase() && f.folderId === targetFolderId && !f.isTrash)) {
          const parts = item.name.split('.');
          if (parts.length > 1) {
            const ext = parts.pop();
            finalName = `${parts.join('.')}_(${counter}).${ext}`;
          } else {
            finalName = `${item.name}_(${counter})`;
          }
          counter++;
        }

        const newFile: FileItem = {
          id: 'file-' + Date.now() + Math.random().toString(36).substring(2, 6),
          name: finalName,
          size: item.size,
          type: item.type,
          category,
          folderId: targetFolderId,
          storagePath,
          url: finalUrl,
          thumbnailUrl: category === 'image' ? finalUrl : undefined,
          isFavorite: false,
          isTrash: false,
          dimensions,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id,
        };

        // If Supabase is connected, insert into DB
        if (supabase && user) {
          await supabase.from('files').insert({
            id: newFile.id,
            user_id: user.id,
            folder_id: targetFolderId,
            name: newFile.name,
            size: newFile.size,
            type: newFile.type,
            category: newFile.category,
            storage_path: newFile.storagePath,
            thumbnail_url: newFile.thumbnailUrl,
            width: dimensions?.width,
            height: dimensions?.height,
            is_favorite: false,
            is_trash: false,
          });
        }

        setFiles(prev => [newFile, ...prev]);

        setUploadQueue(prev =>
          prev.map(p => (p.id === item.id ? { ...p, status: 'completed', progress: 100 } : p))
        );

        addActivity('upload', finalName, 'file', `Uploaded ${item.size} bytes`);
      } catch (err: any) {
        setUploadQueue(prev =>
          prev.map(p => (p.id === item.id ? { ...p, status: 'error', error: err?.message || 'Upload failed' } : p))
        );
      }
    }
  }, [activeFolderId, files, storageStats, user, addActivity]);

  const clearCompletedUploads = () => {
    setUploadQueue(prev => prev.filter(p => p.status === 'uploading' || p.status === 'pending'));
  };

  // Delete & Restore File
  const deleteFile = useCallback((id: string, permanent = false) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    if (permanent) {
      setFiles(prev => prev.filter(f => f.id !== id));
      addActivity('delete', file.name, 'file', 'Permanently deleted');
      // If supabase, delete row
      const supabase = getSupabase();
      if (supabase) {
        supabase.from('files').delete().eq('id', id);
      }
    } else {
      setFiles(prev =>
        prev.map(f =>
          f.id === id ? { ...f, isTrash: true, trashDate: new Date().toISOString() } : f
        )
      );
      addActivity('delete', file.name, 'file', 'Moved to Trash');
    }
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [files, addActivity]);

  const restoreFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    setFiles(prev =>
      prev.map(f =>
        f.id === id ? { ...f, isTrash: false, trashDate: undefined } : f
      )
    );
    addActivity('restore', file.name, 'file', 'Restored from Trash');
  }, [files, addActivity]);

  const toggleFavoriteFile = useCallback((id: string) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id) {
          const nextFav = !f.isFavorite;
          addActivity('favorite', f.name, 'file', nextFav ? 'Added to favorites' : 'Removed from favorites');
          return { ...f, isFavorite: nextFav };
        }
        return f;
      })
    );
  }, [addActivity]);

  const renameFile = useCallback((id: string, newName: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, name: newName, updatedAt: new Date().toISOString() } : f))
    );
    addActivity('move', newName, 'file', `Renamed file to ${newName}`);
  }, [addActivity]);

  const moveFile = useCallback((id: string, newFolderId: string | null) => {
    const file = files.find(f => f.id === id);
    const targetFolder = folders.find(fd => fd.id === newFolderId);
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, folderId: newFolderId, updatedAt: new Date().toISOString() } : f))
    );
    addActivity(
      'move',
      file ? file.name : 'File',
      'file',
      `Moved to ${targetFolder ? targetFolder.name : 'Root'}`
    );
  }, [files, folders, addActivity]);

  // Batch operations
  const batchDelete = useCallback((ids: string[], permanent = false) => {
    ids.forEach(id => deleteFile(id, permanent));
    clearSelection();
  }, [deleteFile, clearSelection]);

  const batchMove = useCallback((ids: string[], targetFolderId: string | null) => {
    ids.forEach(id => moveFile(id, targetFolderId));
    clearSelection();
  }, [moveFile, clearSelection]);

  const batchFavorite = useCallback((ids: string[], fav: boolean) => {
    setFiles(prev =>
      prev.map(f => (ids.includes(f.id) ? { ...f, isFavorite: fav } : f))
    );
    clearSelection();
  }, [clearSelection]);

  const batchDownloadZip = useCallback(async (ids: string[]) => {
    const filesToDownload = files.filter(f => ids.includes(f.id));
    if (filesToDownload.length === 0) return;
    await downloadMultipleAsZip(filesToDownload, `filevault-bundle-${Date.now()}.zip`);
    addActivity('download', `${filesToDownload.length} files`, 'file', 'Downloaded bundle as ZIP');
  }, [files, addActivity]);

  // Folder Operations
  const createFolder = useCallback((name: string, color = '#4f46e5', parentId: string | null = activeFolderId) => {
    const newFolder: FolderItem = {
      id: 'folder-' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: name.trim() || 'New Folder',
      color,
      parentId,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id,
    };
    setFolders(prev => [...prev, newFolder]);
    addActivity('create_folder', newFolder.name, 'folder', 'Created folder');
  }, [activeFolderId, user, addActivity]);

  const renameFolder = useCallback((id: string, newName: string) => {
    setFolders(prev =>
      prev.map(fd => (fd.id === id ? { ...fd, name: newName, updatedAt: new Date().toISOString() } : fd))
    );
    addActivity('move', newName, 'folder', `Renamed folder to ${newName}`);
  }, [addActivity]);

  const deleteFolder = useCallback((id: string, permanent = false) => {
    const folder = folders.find(fd => fd.id === id);
    if (!folder) return;

    if (permanent) {
      // Recursively delete folder and nested contents
      setFolders(prev => prev.filter(fd => fd.id !== id && fd.parentId !== id));
      setFiles(prev => prev.filter(f => f.folderId !== id));
      addActivity('delete', folder.name, 'folder', 'Permanently deleted folder');
    } else {
      setFolders(prev =>
        prev.map(fd => (fd.id === id ? { ...fd, isTrash: true, trashDate: new Date().toISOString() } : fd))
      );
      // Soft-delete child files as well
      setFiles(prev =>
        prev.map(f => (f.folderId === id ? { ...f, isTrash: true, trashDate: new Date().toISOString() } : f))
      );
      addActivity('delete', folder.name, 'folder', 'Moved folder to Trash');
    }

    if (activeFolderId === id) {
      setActiveFolderId(folder.parentId || null);
    }
  }, [folders, activeFolderId, addActivity]);

  const moveFolder = useCallback((id: string, newParentId: string | null) => {
    if (id === newParentId) return; // cannot move into itself
    setFolders(prev =>
      prev.map(fd => (fd.id === id ? { ...fd, parentId: newParentId, updatedAt: new Date().toISOString() } : fd))
    );
  }, []);

  // Album operations
  const createAlbum = useCallback((name: string, description = '', fileIds: string[] = []) => {
    const newAlbum: AlbumItem = {
      id: 'album-' + Date.now(),
      name: name.trim() || 'Untitled Album',
      description,
      coverImageId: fileIds[0] || undefined,
      fileIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAlbums(prev => [...prev, newAlbum]);
    addActivity('create_folder', newAlbum.name, 'album', `Created album with ${fileIds.length} items`);
  }, [addActivity]);

  const addFilesToAlbum = useCallback((albumId: string, fileIds: string[]) => {
    setAlbums(prev =>
      prev.map(album => {
        if (album.id === albumId) {
          const combined = Array.from(new Set([...album.fileIds, ...fileIds]));
          return {
            ...album,
            fileIds: combined,
            coverImageId: album.coverImageId || combined[0],
            updatedAt: new Date().toISOString(),
          };
        }
        return album;
      })
    );
  }, []);

  const removeFileFromAlbum = useCallback((albumId: string, fileId: string) => {
    setAlbums(prev =>
      prev.map(album => {
        if (album.id === albumId) {
          const nextIds = album.fileIds.filter(id => id !== fileId);
          return {
            ...album,
            fileIds: nextIds,
            coverImageId: album.coverImageId === fileId ? nextIds[0] : album.coverImageId,
            updatedAt: new Date().toISOString(),
          };
        }
        return album;
      })
    );
  }, []);

  const deleteAlbum = useCallback((albumId: string) => {
    setAlbums(prev => prev.filter(a => a.id !== albumId));
  }, []);

  // Trash operations
  const emptyTrash = useCallback(() => {
    setFiles(prev => prev.filter(f => !f.isTrash));
    setFolders(prev => prev.filter(fd => !fd.isTrash));
    addActivity('delete', 'Trash', 'file', 'Emptied all items in Trash');
  }, [addActivity]);

  const restoreAllTrash = useCallback(() => {
    setFiles(prev => prev.map(f => (f.isTrash ? { ...f, isTrash: false, trashDate: undefined } : f)));
    setFolders(prev => prev.map(fd => (fd.isTrash ? { ...fd, isTrash: false, trashDate: undefined } : fd)));
    addActivity('restore', 'All items', 'file', 'Restored all items from Trash');
  }, [addActivity]);

  // Modal target helpers
  const openRenameModal = (id: string, name: string, type: 'file' | 'folder') => {
    setRenameTarget({ id, name, type });
    setIsRenameModalOpen(true);
  };

  const openMoveModal = (id: string, name: string, type: 'file' | 'folder') => {
    setMoveTarget({ id, name, type });
    setIsMoveModalOpen(true);
  };

  const openShareModal = (file: FileItem) => {
    setShareTargetFile(file);
    setIsShareModalOpen(true);
  };

  // Preview navigation
  const openPreview = useCallback((file: FileItem) => {
    setActivePreviewFile(file);
  }, []);

  const closePreview = useCallback(() => {
    setActivePreviewFile(null);
  }, []);

  const navigatePreview = useCallback((direction: 'next' | 'prev') => {
    if (!activePreviewFile) return;
    const currentList = files.filter(f => !f.isTrash && (f.category === activePreviewFile.category || activePreviewFile.category === 'image'));
    const currentIndex = currentList.findIndex(f => f.id === activePreviewFile.id);
    if (currentIndex === -1) return;

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % currentList.length;
      setActivePreviewFile(currentList[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
      setActivePreviewFile(currentList[prevIndex]);
    }
  }, [activePreviewFile, files]);

  // Auth Operations
  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url || '',
          storageQuotaBytes: 5 * 1024 * 1024 * 1024,
        });
      }
      return {};
    }

    // Demo login
    setUser({
      id: 'usr-' + Date.now(),
      email,
      fullName: email.split('@')[0],
      storageQuotaBytes: 5 * 1024 * 1024 * 1024,
    });
    return {};
  };

  const signUp = async (email: string, pass: string, name: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } },
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: name || email.split('@')[0],
          storageQuotaBytes: 5 * 1024 * 1024 * 1024,
        });
      }
      return {};
    }

    // Demo signup
    setUser({
      id: 'usr-' + Date.now(),
      email,
      fullName: name || email.split('@')[0],
      storageQuotaBytes: 5 * 1024 * 1024 * 1024,
    });
    return {};
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const configureSupabase = (url: string, key: string) => {
    localStorage.setItem('filevault_supabase_url', url);
    localStorage.setItem('filevault_supabase_anon_key', key);
    resetSupabaseClient();
    setIsSupabaseConfigured(Boolean(url && key));
  };

  const resetAllData = () => {
    localStorage.removeItem('filevault_files');
    localStorage.removeItem('filevault_folders');
    localStorage.removeItem('filevault_albums');
    localStorage.removeItem('filevault_activities');
    setFiles(INITIAL_FILES);
    setFolders(INITIAL_FOLDERS);
    setAlbums(INITIAL_ALBUMS);
    setActivities(INITIAL_ACTIVITIES);
    setSelectedFileIds(new Set());
    setActiveFolderId(null);
  };

  return (
    <VaultContext.Provider
      value={{
        user,
        isSupabaseConfigured,
        theme,
        toggleTheme,
        files,
        folders,
        albums,
        activities,
        storageStats,
        activeSection,
        setActiveSection,
        activeFolderId,
        setActiveFolderId,
        folderBreadcrumbs,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        sortConfig,
        setSortConfig,
        selectedFileIds,
        toggleFileSelection,
        selectAllFiles,
        clearSelection,
        uploadFiles,
        uploadQueue,
        clearCompletedUploads,
        deleteFile,
        restoreFile,
        toggleFavoriteFile,
        renameFile,
        moveFile,
        batchDelete,
        batchMove,
        batchFavorite,
        batchDownloadZip,
        createFolder,
        renameFolder,
        deleteFolder,
        moveFolder,
        createAlbum,
        addFilesToAlbum,
        removeFileFromAlbum,
        deleteAlbum,
        emptyTrash,
        restoreAllTrash,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isCreateFolderModalOpen,
        setIsCreateFolderModalOpen,
        isRenameModalOpen,
        setIsRenameModalOpen,
        renameTarget,
        openRenameModal,
        isMoveModalOpen,
        setIsMoveModalOpen,
        moveTarget,
        openMoveModal,
        isShareModalOpen,
        setIsShareModalOpen,
        shareTargetFile,
        openShareModal,
        isCreateAlbumModalOpen,
        setIsCreateAlbumModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activePreviewFile,
        openPreview,
        closePreview,
        navigatePreview,
        login,
        signUp,
        logout,
        configureSupabase,
        resetAllData,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
