import React, { useEffect } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setIsShortcutsModalOpen } = useVault();

  // Listen for '?' key to toggle shortcuts modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsShortcutsModalOpen(!isShortcutsModalOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsModalOpen, setIsShortcutsModalOpen]);

  if (!isShortcutsModalOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K / ⌘K', desc: 'Focus global search input' },
    { key: 'Esc', desc: 'Close any open modal or image preview' },
    { key: '← / → Arrows', desc: 'Navigate previous / next item in gallery preview' },
    { key: 'Drag & Drop', desc: 'Drop files anywhere on window to instantly upload' },
    { key: 'Drag File to Folder', desc: 'Move file directly into destination folder' },
    { key: '?', desc: 'Open this keyboard shortcuts guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-400">Boost your productivity in FileVault</p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {sc.desc}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-200/80 dark:bg-slate-700 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-100 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
