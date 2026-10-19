import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Folder,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatBytes, formatDate } from '../../lib/utils';
import type { FileItem, FolderItem } from '../../types';

export const TrashView: React.FC = () => {
  const {
    files,
    folders,
    restoreFile,
    deleteFile,
    deleteFolder,
    restoreAllTrash,
    emptyTrash,
  } = useVault();

  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);

  const trashedFiles = files.filter(f => f.isTrash);
  const trashedFolders = folders.filter(fd => fd.isTrash);
  const totalTrashCount = trashedFiles.length + trashedFolders.length;

  const handlePermanentDeleteFile = (file: FileItem) => {
    if (confirm(`Permanently delete "${file.name}"? This action cannot be undone.`)) {
      deleteFile(file.id, true);
    }
  };

  const handlePermanentDeleteFolder = (folder: FolderItem) => {
    if (confirm(`Permanently delete folder "${folder.name}" and all contents? This cannot be undone.`)) {
      deleteFolder(folder.id, true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-500" />
            <span>Trash & Recovery</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Items in trash can be restored to their original location or permanently deleted.
          </p>
        </div>

        {totalTrashCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={restoreAllTrash}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
              <span>Restore All</span>
            </button>

            <button
              onClick={() => setConfirmEmptyOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Banner for Emptying Trash */}
      {confirmEmptyOpen && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-rose-900 dark:text-rose-200">
                Are you sure you want to permanently delete all {totalTrashCount} items?
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                This will purge file binaries and records permanently. This action cannot be reversed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setConfirmEmptyOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                emptyTrash();
                setConfirmEmptyOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow transition-colors"
            >
              Yes, Purge Everything
            </button>
          </div>
        </div>
      )}

      {/* Trash Empty State */}
      {totalTrashCount === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
            Trash is Empty
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            There are no deleted files or folders in your trash bin. All items are safe in your vault.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trashed Folders */}
          {trashedFolders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Deleted Folders ({trashedFolders.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trashedFolders.map(folder => (
                  <div
                    key={folder.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {folder.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Deleted {formatDate(folder.trashDate || folder.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => restoreFile(folder.id)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Restore Folder"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteFolder(folder)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trashed Files Table */}
          {trashedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Deleted Files ({trashedFiles.length})
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Trashed Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashedFiles.map(file => (
                      <tr
                        key={file.id}
                        className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {file.category === 'image' && (file.thumbnailUrl || file.url) ? (
                                <img
                                  src={file.thumbnailUrl || file.url}
                                  alt=""
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <span className="truncate max-w-xs sm:max-w-md">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                          {formatBytes(file.size)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {formatDate(file.trashDate || file.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => restoreFile(file.id)}
                              className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Restore File"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDeleteFile(file)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
