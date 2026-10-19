import React, { useState } from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const CreateAlbumModal: React.FC = () => {
  const { isCreateAlbumModalOpen, setIsCreateAlbumModalOpen, files, createAlbum } = useVault();
  const [albumName, setAlbumName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  if (!isCreateAlbumModalOpen) return null;

  const photoFiles = files.filter(f => !f.isTrash && f.category === 'image');

  const togglePhoto = (id: string) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    createAlbum(albumName.trim(), description.trim(), Array.from(selectedPhotos));
    setAlbumName('');
    setDescription('');
    setSelectedPhotos(new Set());
    setIsCreateAlbumModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Create Photo Album
              </h3>
              <p className="text-xs text-slate-400">Group photos into a curated showcase</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateAlbumModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-1 flex flex-col min-h-0">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Album Title
            </label>
            <input
              type="text"
              autoFocus
              value={albumName}
              onChange={e => setAlbumName(e.target.value)}
              placeholder="e.g. Summer Vacation & Family"
              className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Highlights from mountain excursions"
              className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-900 dark:text-white"
            />
          </div>

          {/* Photo Selector Grid */}
          <div className="flex-1 min-h-[140px] flex flex-col">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Photos to Include ({selectedPhotos.size} selected)
            </label>
            <div className="flex-1 overflow-y-auto p-1 grid grid-cols-4 sm:grid-cols-5 gap-2 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40">
              {photoFiles.map(photo => {
                const isSelected = selectedPhotos.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => togglePhoto(photo.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all ${
                      isSelected
                        ? 'ring-2 ring-brand-500 border-white'
                        : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-brand-600/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateAlbumModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!albumName.trim()}
              className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-colors"
            >
              Create Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
