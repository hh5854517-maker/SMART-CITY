import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Image as ImageIcon, Calendar } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatDate } from '../../lib/utils';
import type { AlbumItem } from '../../types';

interface AlbumsViewProps {
  onSelectAlbum: (albumId: string) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ onSelectAlbum }) => {
  const { albums, files, setIsCreateAlbumModalOpen, deleteAlbum } = useVault();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Custom Photo Albums
          </h2>
          <p className="text-xs text-slate-400">
            Curate photo collections and portfolios
          </p>
        </div>

        <button
          onClick={() => setIsCreateAlbumModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Album</span>
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            No albums created yet
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Group your favorite travel, family, and portfolio photos into albums.
          </p>
          <button
            onClick={() => setIsCreateAlbumModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Create Your First Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {albums.map(album => {
            // Find cover image or first image
            const coverFile = files.find(f => f.id === album.coverImageId) ||
              files.find(f => album.fileIds.includes(f.id));

            return (
              <div
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Album Cover Thumbnail */}
                <div className="w-full h-44 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                  {coverFile && (coverFile.thumbnailUrl || coverFile.url) ? (
                    <img
                      src={coverFile.thumbnailUrl || coverFile.url}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-10 h-10 stroke-1" />
                      <span className="text-xs mt-1 font-medium">Empty Album</span>
                    </div>
                  )}

                  {/* Photo count pill */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                    {album.fileIds.length} {album.fileIds.length === 1 ? 'photo' : 'photos'}
                  </div>

                  {/* Delete Album Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete album "${album.name}"? The photos will remain in your vault.`)) {
                        deleteAlbum(album.id);
                      }
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 text-white hover:bg-rose-600 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Album"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Album Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {album.name}
                    </h3>
                    {album.description && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 font-medium">
                    Updated {formatDate(album.updatedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
