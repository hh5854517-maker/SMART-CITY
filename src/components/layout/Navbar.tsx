import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Grid,
  List,
  Bell,
  Sun,
  Moon,
  Settings,
  LogOut,
  User,
  SlidersHorizontal,
  X,
  Check,
  HardDrive,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Layers,
  Menu,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import type { FileCategory } from '../../types';
import { formatDate } from '../../lib/utils';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    user,
    theme,
    toggleTheme,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    activities,
    setIsSettingsModalOpen,
    setIsAuthModalOpen,
    logout,
  } = useVault();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filterOptions: { label: string; value: FileCategory | 'all'; icon: React.ElementType }[] = [
    { label: 'All', value: 'all', icon: Layers },
    { label: 'Photos', value: 'image', icon: Image },
    { label: 'Videos', value: 'video', icon: Video },
    { label: 'Docs', value: 'document', icon: FileText },
    { label: 'Audio', value: 'audio', icon: Music },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search files, photos, folders... (Ctrl+K)"
            className="w-full pl-10 pr-10 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-transparent focus:border-brand-500/40 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 rounded">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Type Quick-Filters (visible on larger screens) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          {filterOptions.map(opt => {
            const Icon = opt.icon;
            const isSelected = typeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Controls: View Switcher, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Grid / List View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List view"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            title="Activity Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 p-4 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Recent Activity</h3>
                  <span className="text-xs text-slate-400">{activities.length} events</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {activities.slice(0, 8).map(act => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-3 transition-colors"
                    >
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {act.targetName}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
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
            </>
          )}
        </div>

        {/* User Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 p-3 animate-scale-in">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Storage & Supabase Config</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="p-2 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      You are in guest browsing mode. Sign in to sync your vault.
                    </p>
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
