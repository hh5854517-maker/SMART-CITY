import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  MoreVertical,
  Star,
  Download,
  Share2,
  Trash2,
  Edit3,
  FolderInput,
  Check,
  Eye,
} from 'lucide-react';
import type { FileItem } from '../../types';
import { useVault } from '../../context/VaultContext';
import { formatBytes, formatDate, downloadFile } from '../../lib/utils';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({ file, isSelected }) => {
  const {
    openPreview,
    toggleFileSelection,
    toggleFavoriteFile,
    openRenameModal,
    openMoveModal,
    openShareModal,
    deleteFile,
  } = useVault();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/filevault-file', file.id);
  };

  const getCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-indigo-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-pink-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-amber-500" />;
      case 'archive':
        return <Archive className="w-8 h-8 text-purple-500" />;
      default:
        return <FileText className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => openPreview(file)}
      className={`group relative p-3 rounded-2xl bg-white dark:bg-slate-800/80 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col select-none ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/20'
          : 'border-slate-200/80 dark:border-slate-700/80 hover:border-brand-300 dark:hover:border-brand-600'
      }`}
    >
      {/* Thumbnail or Icon Preview Container */}
      <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center relative mb-3">
        {file.category === 'image' && (file.thumbnailUrl || file.url) ? (
          <img
            src={file.thumbnailUrl || file.url}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center">
            {getCategoryIcon()}
            <span className="text-[10px] mt-1.5 font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {file.name.split('.').pop() || file.category}
            </span>
          </div>
        )}

        {/* Selection Checkbox (always visible when selected, visible on hover otherwise) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFileSelection(file.id);
          }}
          className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-600 text-white ring-2 ring-white shadow'
              : 'bg-black/30 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/50'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Favorite Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteFile(file.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-opacity ${
            file.isFavorite
              ? 'bg-amber-500 text-white opacity-100 shadow'
              : 'bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50'
          }`}
          title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Quick Preview Hover Overlay */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </div>
        </div>
      </div>

      {/* File Details & Options */}
      <div className="flex items-start justify-between gap-2 mt-auto">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={file.name}>
            {file.name}
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {formatBytes(file.size)} • {formatDate(file.createdAt)}
          </p>
        </div>

        {/* Action Dropdown Menu */}
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
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-40 p-1.5 animate-scale-in text-xs font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    openPreview(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    downloadFile(file.url, file.name);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    openShareModal(file);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share link</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    openRenameModal(file.id, file.name, 'file');
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
                    openMoveModal(file.id, file.name, 'file');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Move to folder</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    deleteFile(file.id);
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
    </div>
  );
};
