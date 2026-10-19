import React from 'react';
import {
  Files,
  HardDrive,
  Star,
  UploadCloud,
  Clock,
  Sparkles,
  ArrowUpRight,
  FolderPlus,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatBytes, formatDate } from '../../lib/utils';
import type { FileItem } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    user,
    files,
    folders,
    storageStats,
    activities,
    setActiveSection,
    openPreview,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    toggleFavoriteFile,
  } = useVault();

  const activeFiles = files.filter(f => !f.isTrash);
  const recentFiles = [...activeFiles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  const favoriteFiles = activeFiles.filter(f => f.isFavorite).slice(0, 4);

  const usedPercent = Math.min(
    100,
    Math.round((storageStats.usedBytes / storageStats.totalQuotaBytes) * 100)
  );

  const quotaRemaining = Math.max(0, storageStats.totalQuotaBytes - storageStats.usedBytes);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-brand-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Personal Encrypted Vault Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user ? user.fullName : 'Vault User'}
            </h1>
            <p className="text-sm text-brand-100/90 leading-relaxed">
              Your files and photos are synchronized with Row-Level Security. Upload, preview, organize, or create albums in one seamless workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Quick Upload</span>
            </button>
            <button
              onClick={() => setIsCreateFolderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-md transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-48 h-48 rounded-full bg-purple-400/20 blur-xl pointer-events-none" />
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Files Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Files
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeFiles.length}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Across {folders.filter(f => !f.isTrash).length} organized folders</span>
          </div>
        </div>

        {/* Used Storage Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Used Storage
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatBytes(storageStats.usedBytes)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>{usedPercent}% of 5 GB quota</span>
          </div>
        </div>

        {/* Available Quota Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Remaining Space
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatBytes(quotaRemaining)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Safe and available for uploads</span>
          </div>
        </div>

        {/* Favourites Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Starred Items
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeFiles.filter(f => f.isFavorite).length}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <button
              onClick={() => setActiveSection('favorites')}
              className="hover:underline flex items-center gap-0.5"
            >
              <span>View starred items</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Storage Breakdown Bars */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Storage Usage by Category
            </h2>
            <p className="text-xs text-slate-400">
              Breakdown of your files by mime classification
            </p>
          </div>
          <button
            onClick={() => setActiveSection('storage')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Detailed Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex mb-4">
          {storageStats.categories.map(cat => {
            const widthPct = storageStats.totalQuotaBytes > 0
              ? (cat.bytes / storageStats.totalQuotaBytes) * 100
              : 0;
            if (widthPct <= 0) return null;
            return (
              <div
                key={cat.category}
                style={{ width: `${Math.max(1, widthPct)}%`, backgroundColor: cat.color }}
                title={`${cat.name}: ${formatBytes(cat.bytes)} (${cat.count} files)`}
                className="h-full transition-all duration-300"
              />
            );
          })}
        </div>

        {/* Category Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {storageStats.categories.map(cat => (
            <div
              key={cat.category}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {cat.name.split(' ')[0]}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {formatBytes(cat.bytes)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Uploaded Files & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Files Grid (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recently Uploaded Files
              </h2>
            </div>
            <button
              onClick={() => setActiveSection('files')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentFiles.map(file => (
              <div
                key={file.id}
                onClick={() => openPreview(file)}
                className="group relative p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer transition-all duration-200 flex flex-col"
              >
                {/* Thumbnail / Icon Container */}
                <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative mb-2.5">
                  {file.category === 'image' && file.url ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : file.category === 'video' ? (
                    <div className="flex flex-col items-center text-pink-500">
                      <Video className="w-8 h-8" />
                      <span className="text-[10px] mt-1 font-semibold uppercase">Video</span>
                    </div>
                  ) : file.category === 'audio' ? (
                    <div className="flex flex-col items-center text-amber-500">
                      <Music className="w-8 h-8" />
                      <span className="text-[10px] mt-1 font-semibold uppercase">Audio</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-blue-500">
                      <FileText className="w-8 h-8" />
                      <span className="text-[10px] mt-1 font-semibold uppercase">Doc</span>
                    </div>
                  )}

                  {/* Favorite button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteFile(file.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-opacity ${
                      file.isFavorite
                        ? 'bg-amber-500 text-white opacity-100'
                        : 'bg-black/40 text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatBytes(file.size)} • {formatDate(file.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log (1 column on lg) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <span className="text-xs text-slate-400">Live Audit</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
            {activities.slice(0, 6).map(act => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {act.targetName}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {act.details || act.action}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
