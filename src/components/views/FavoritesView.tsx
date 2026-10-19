import React from 'react';
import { Star, Download, Trash2 } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { FileCard } from '../files/FileCard';
import { FileRow } from '../files/FileRow';
import { downloadMultipleAsZip } from '../../lib/utils';

export const FavoritesView: React.FC = () => {
  const { files, viewMode, selectedFileIds, batchDownloadZip, batchDelete } = useVault();

  const favoriteFiles = files.filter(f => !f.isTrash && f.isFavorite);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-current" />
            <span>Starred Items ({favoriteFiles.length})</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quick access to your most important and frequently referenced files
          </p>
        </div>

        {favoriteFiles.length > 0 && (
          <button
            onClick={() => batchDownloadZip(favoriteFiles.map(f => f.id))}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download All Starred (ZIP)</span>
          </button>
        )}
      </div>

      {favoriteFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-sm">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
            No Starred Items Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Click the star icon on any photo or file in your vault to bookmark it here for instant access.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {favoriteFiles.map(file => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedFileIds.has(file.id)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase">
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
              {favoriteFiles.map(file => (
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
  );
};
