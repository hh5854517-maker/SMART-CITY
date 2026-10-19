import React, { useMemo } from 'react';
import {
  FolderPlus,
  UploadCloud,
  ArrowUpDown,
  Download,
  Trash2,
  FolderInput,
  Star,
  X,
  Layers,
  Search,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { FolderCard } from './FolderCard';
import { FileCard } from './FileCard';
import { FileRow } from './FileRow';
import type { SortField } from '../../types';

export const FilesView: React.FC = () => {
  const {
    files,
    folders,
    activeFolderId,
    viewMode,
    searchQuery,
    typeFilter,
    sortConfig,
    setSortConfig,
    selectedFileIds,
    selectAllFiles,
    clearSelection,
    batchDelete,
    batchFavorite,
    batchDownloadZip,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    openMoveModal,
  } = useVault();

  // Filter folders in current directory
  const currentFolders = useMemo(() => {
    return folders.filter(fd => {
      if (fd.isTrash) return false;
      if (searchQuery) {
        return fd.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return fd.parentId === activeFolderId;
    });
  }, [folders, activeFolderId, searchQuery]);

  // Filter and sort files in current directory
  const currentFiles = useMemo(() => {
    let result = files.filter(f => {
      if (f.isTrash) return false;
      if (typeFilter !== 'all' && f.category !== typeFilter) return false;
      if (searchQuery) {
        return f.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return f.folderId === activeFolderId;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [files, activeFolderId, typeFilter, searchQuery, sortConfig]);

  const allVisibleFileIds = useMemo(() => currentFiles.map(f => f.id), [currentFiles]);
  const isAllSelected = allVisibleFileIds.length > 0 && allVisibleFileIds.every(id => selectedFileIds.has(id));

  const handleSortToggle = (field: SortField) => {
    if (sortConfig.field === field) {
      setSortConfig({
        field,
        order: sortConfig.order === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ field, order: 'desc' });
    }
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllFiles(allVisibleFileIds);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumbs />

      {/* Toolbar & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentFiles.length > 0 && (
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-brand-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium ml-2">
            <span>Sort by:</span>
            <button
              onClick={() => handleSortToggle('date')}
              className={`px-2 py-1 rounded-md transition-colors ${
                sortConfig.field === 'date'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Date {sortConfig.field === 'date' && (sortConfig.order === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortToggle('name')}
              className={`px-2 py-1 rounded-md transition-colors ${
                sortConfig.field === 'name'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Name {sortConfig.field === 'name' && (sortConfig.order === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortToggle('size')}
              className={`px-2 py-1 rounded-md transition-colors ${
                sortConfig.field === 'size'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Size {sortConfig.field === 'size' && (sortConfig.order === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Multi-Selection Sticky Bar */}
      {selectedFileIds.size > 0 && (
        <div className="sticky top-20 z-20 flex items-center justify-between px-4 py-3 rounded-2xl bg-brand-600 text-white shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">
              {selectedFileIds.size} {selectedFileIds.size === 1 ? 'item' : 'items'} selected
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => batchDownloadZip(Array.from(selectedFileIds))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>

            <button
              onClick={() => batchFavorite(Array.from(selectedFileIds), true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>Star</span>
            </button>

            <button
              onClick={() => batchDelete(Array.from(selectedFileIds))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>

            <button
              onClick={clearSelection}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors ml-2"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Folders Section */}
      {currentFolders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Folders ({currentFolders.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {currentFolders.map(folder => {
              const childCount = files.filter(f => f.folderId === folder.id && !f.isTrash).length;
              return <FolderCard key={folder.id} folder={folder} itemCount={childCount} />;
            })}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Files ({currentFiles.length})
        </h3>

        {currentFiles.length === 0 && currentFolders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No files in this folder
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-5">
              Drag and drop any documents, images, audio, or video files here, or click upload to get started.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Upload Files
              </button>
              <button
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Create Folder
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {currentFiles.map(file => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFileIds.has(file.id)}
              />
            ))}
          </div>
        ) : (
          /* List View Table */
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10"></th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Category</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3 hidden md:table-cell">Date Added</th>
                  <th className="py-3 px-3 w-10"></th>
                  <th className="py-3 px-3 w-12 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFiles.map(file => (
                  <FileRow
                    key={file.id}
                    file={file}
                    isSelected={selectedFileIds.has(file.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
