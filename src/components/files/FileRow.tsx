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

interface FileRowProps {
  file: FileItem;
  isSelected: boolean;
}

export const FileRow: React.FC<FileRowProps> = ({ file, isSelected }) => {
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

  const getCategoryIcon = () => {
    switch (file.category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-pink-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <tr
      onClick={() => openPreview(file)}
      className={`group border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs select-none ${
        isSelected ? 'bg-brand-50/40 dark:bg-brand-950/30' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-3 w-10" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleFileSelection(file.id)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </td>

      {/* Name + Icon */}
      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            {file.category === 'image' && (file.thumbnailUrl || file.url) ? (
              <img
                src={file.thumbnailUrl || file.url}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              getCategoryIcon()
            )}
          </div>
          <span className="truncate max-w-xs md:max-w-md font-semibold" title={file.name}>
            {file.name}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 capitalize hidden sm:table-cell">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {file.category}
        </span>
      </td>

      {/* File Size */}
      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
        {formatBytes(file.size)}
      </td>

      {/* Date */}
      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
        {formatDate(file.createdAt)}
      </td>

      {/* Favorite Star */}
      <td className="py-3 px-3 w-10" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleFavoriteFile(file.id)}
          className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
          title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </td>

      {/* Actions Menu */}
      <td className="py-3 px-3 w-12 text-right relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setIsMenuOpen(prev => !prev)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-3 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-40 p-1.5 animate-scale-in text-xs font-medium text-left">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openPreview(file);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  downloadFile(file.url, file.name);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openShareModal(file);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share link</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openRenameModal(file.id, file.name, 'file');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
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
                onClick={() => {
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
      </td>
    </tr>
  );
};
