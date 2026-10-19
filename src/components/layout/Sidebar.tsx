import React, { useState } from 'react';
import {
  HardDrive,
  Home,
  Folder,
  Image,
  BookOpen,
  Star,
  Clock,
  Trash2,
  PieChart,
  Plus,
  FolderPlus,
  UploadCloud,
  ChevronRight,
  Shield,
  Menu,
  X,
  Database,
  Keyboard,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatBytes } from '../../lib/utils';
import type { ActiveSection } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeSection,
    setActiveSection,
    setActiveFolderId,
    folders,
    files,
    storageStats,
    setIsUploadModalOpen,
    setIsCreateFolderModalOpen,
    setIsSettingsModalOpen,
    setIsShortcutsModalOpen,
    isSupabaseConfigured,
  } = useVault();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const trashCount = files.filter(f => f.isTrash).length + folders.filter(f => f.isTrash).length;
  const favCount = files.filter(f => f.isFavorite && !f.isTrash).length;

  const usedPercent = Math.min(
    100,
    Math.round((storageStats.usedBytes / storageStats.totalQuotaBytes) * 100)
  );

  const handleNavClick = (section: ActiveSection) => {
    setActiveSection(section);
    if (section !== 'files') {
      setActiveFolderId(null);
    }
    setMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'files', label: 'My Files', icon: Folder },
    { id: 'photos', label: 'Photos & Gallery', icon: Image },
    { id: 'albums', label: 'Albums', icon: BookOpen },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: favCount > 0 ? favCount : undefined },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'trash', label: 'Trash', icon: Trash2, badge: trashCount > 0 ? trashCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'storage', label: 'Storage Usage', icon: PieChart },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                FileVault
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-md border border-brand-200/50 dark:border-brand-800/50">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Personal Cloud</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Action Button & Dropdown */}
      <div className="p-4 relative">
        <button
          onClick={() => setIsNewMenuOpen(prev => !prev)}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>New Upload</span>
          <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-200 ${isNewMenuOpen ? 'rotate-90' : ''}`} />
        </button>

        {isNewMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsNewMenuOpen(false)} 
            />
            <div className="absolute top-16 left-4 right-4 z-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200/80 dark:border-slate-700 p-2 animate-scale-in">
              <button
                onClick={() => {
                  setIsUploadModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg font-medium transition-colors"
              >
                <div className="p-1.5 bg-brand-100/60 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-md">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <span>Upload Files</span>
              </button>

              <button
                onClick={() => {
                  setIsCreateFolderModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg font-medium transition-colors"
              >
                <div className="p-1.5 bg-amber-100/60 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-md">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <span>New Folder</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as ActiveSection)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-200/40 dark:border-brand-800/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
                    item.badgeColor || 'bg-brand-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Supabase Status Indicator & Help */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
            isSupabaseConfigured
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConfigured ? 'Supabase Sync Active' : 'Demo Mode (Offline)'}</span>
          </div>
          <span className="underline text-[11px]">Configure</span>
        </button>

        <button
          onClick={() => setIsShortcutsModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200/80 dark:bg-slate-700 font-mono rounded">?</kbd>
        </button>
      </div>

      {/* Storage Quota Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Storage Usage</span>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {usedPercent}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usedPercent > 90
                ? 'bg-rose-500'
                : usedPercent > 70
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-brand-500 to-indigo-500'
            }`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{formatBytes(storageStats.usedBytes)} used</span>
          <span>{formatBytes(storageStats.totalQuotaBytes)} total</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 z-10 animate-fade-in shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
