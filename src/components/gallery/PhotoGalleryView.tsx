import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  BookOpen,
  Plus,
  Star,
  Check,
  Download,
  Trash2,
  FolderPlus,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpDown,
  Maximize2,
  X,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import type { FileItem, AlbumItem, SortField } from '../../types';
import { formatDate, formatBytes, downloadMultipleAsZip } from '../../lib/utils';
import { AlbumsView } from './AlbumsView';

export const PhotoGalleryView: React.FC = () => {
  const {
    files,
    albums,
    openPreview,
    selectedFileIds,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    batchFavorite,
    batchDelete,
    batchDownloadZip,
    setIsCreateAlbumModalOpen,
    setIsUploadModalOpen,
    toggleFavoriteFile,
    sortConfig,
    setSortConfig,
  } = useVault();

  const [activeTab, setActiveTab] = useState<'photos' | 'albums'>('photos');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Filter image files only
  const photoFiles = useMemo(() => {
    let images = files.filter(f => !f.isTrash && f.category === 'image');

    if (filterFavoritesOnly) {
      images = images.filter(f => f.isFavorite);
    }

    if (selectedAlbumId) {
      const album = albums.find(a => a.id === selectedAlbumId);
      if (album) {
        images = images.filter(f => album.fileIds.includes(f.id));
      }
    }

    // Sort
    images.sort((a, b) => {
      let cmp = 0;
      switch (sortConfig.field) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'size':
          cmp = a.size - b.size;
          break;
        case 'date':
        default:
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortConfig.order === 'asc' ? cmp : -cmp;
    });

    return images;
  }, [files, filterFavoritesOnly, selectedAlbumId, albums, sortConfig]);

  const allPhotoIds = useMemo(() => photoFiles.map(p => p.id), [photoFiles]);
  const isAllSelected = allPhotoIds.length > 0 && allPhotoIds.every(id => selectedFileIds.has(id));

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedAlbum ? selectedAlbum.name : 'Photo Gallery'}
            </h1>
            {selectedAlbum && (
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Back to all photos"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {selectedAlbum
              ? selectedAlbum.description || `Viewing ${photoFiles.length} photos in album`
              : `Explore ${photoFiles.length} high-resolution photographs & memories`}
          </p>
        </div>

        {/* Tab Switcher & Action buttons */}
        <div className="flex items-center gap-2">
          {!selectedAlbum && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'photos'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setActiveTab('albums')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'albums'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Albums ({albums.length})</span>
              </button>
            </div>
          )}

          {activeTab === 'photos' && (
            <>
              <button
                onClick={() => setFilterFavoritesOnly(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  filterFavoritesOnly
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-current' : ''}`} />
                <span>Favorites</span>
              </button>

              <button
                onClick={() => setIsCreateAlbumModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-brand-500" />
                <span>New Album</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* If Albums Tab is active */}
      {activeTab === 'albums' && !selectedAlbumId ? (
        <AlbumsView onSelectAlbum={(id) => setSelectedAlbumId(id)} />
      ) : (
        <>
          {/* Multi-Selection Sticky Bar */}
          {selectedFileIds.size > 0 && (
            <div className="sticky top-20 z-20 flex items-center justify-between px-4 py-3 rounded-2xl bg-brand-600 text-white shadow-xl animate-fade-in">
              <span className="font-bold text-sm">
                {selectedFileIds.size} photo{selectedFileIds.size === 1 ? '' : 's'} selected
              </span>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  onClick={() => batchDownloadZip(Array.from(selectedFileIds))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Selected</span>
                </button>
                <button
                  onClick={() => batchFavorite(Array.from(selectedFileIds), true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Favorite</span>
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
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Photo Gallery Grid */}
          {photoFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                {filterFavoritesOnly ? 'No starred photos' : 'No photos found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Upload JPG, PNG, WEBP, or GIF images to start building your gallery.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Upload Photos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {photoFiles.map(photo => {
                const isSelected = selectedFileIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => openPreview(photo)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl ${
                      isSelected
                        ? 'ring-4 ring-brand-500 border-white'
                        : 'border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {/* Lazy-loaded photo */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for labels */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                      {/* Top Action Buttons: Checkbox & Star */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(photo.id);
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-brand-600 text-white ring-2 ring-white shadow'
                              : 'bg-black/40 text-white backdrop-blur-md hover:bg-black/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteFile(photo.id);
                          }}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-opacity ${
                            photo.isFavorite
                              ? 'bg-amber-500 text-white'
                              : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      {/* Bottom Info: Title, Size, Dimensions */}
                      <div className="text-white min-w-0">
                        <p className="text-xs font-semibold truncate" title={photo.name}>
                          {photo.name}
                        </p>
                        <p className="text-[10px] text-white/70">
                          {formatBytes(photo.size)}
                          {photo.dimensions ? ` • ${photo.dimensions.width}×${photo.dimensions.height}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* If selected, keep checkmark badge visible */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
