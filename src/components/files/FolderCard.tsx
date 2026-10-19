import React, { useState } from 'react';
import { Folder, MoreVertical, Trash2, Edit3, FolderInput, Star } from 'lucide-react';
import type { FolderItem } from '../../types';
import { useVault } from '../../context/VaultContext';

interface FolderCardProps {
  folder: FolderItem;
  itemCount: number;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, itemCount }) => {
  const {
    setActiveFolderId,
    openRenameModal,
    openMoveModal,
    deleteFolder,
    moveFile,
    folders,
  } = useVault();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const fileId = e.dataTransfer.getData('application/filevault-file');
    if (fileId) {
      moveFile(fileId, folder.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => setActiveFolderId(folder.id)}
      className={`group relative p-4 rounded-2xl bg-white dark:bg-slate-800/80 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md select-none ${
        isDragOver
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40'
          : 'border-slate-200/80 dark:border-slate-700/80 hover:border-brand-300 dark:hover:border-brand-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${folder.color || '#4f46e5'}18` }}
        >
          <Folder
            className="w-5 h-5"
            style={{ color: folder.color || '#4f46e5' }}
          />
        </div>

        {/* Options Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(prev => !prev);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-40 p-1.5 animate-scale-in text-xs font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    openRenameModal(folder.id, folder.name, 'folder');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    openMoveModal(folder.id, folder.name, 'folder');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Move Folder</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    deleteFolder(folder.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate" title={folder.name}>
          {folder.name}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>
    </div>
  );
};
