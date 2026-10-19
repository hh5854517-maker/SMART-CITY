import React, { useState } from 'react';
import { X, FolderInput, HardDrive, Folder, Check } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const MoveModal: React.FC = () => {
  const { isMoveModalOpen, setIsMoveModalOpen, moveTarget, folders, moveFile, moveFolder } = useVault();
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

  if (!isMoveModalOpen || !moveTarget) return null;

  // Filter valid destination folders (cannot move folder into itself)
  const availableFolders = folders.filter(f => !f.isTrash && f.id !== moveTarget.id);

  const handleMove = () => {
    if (moveTarget.type === 'file') {
      moveFile(moveTarget.id, selectedDestinationId);
    } else {
      moveFolder(moveTarget.id, selectedDestinationId);
    }
    setIsMoveModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Move {moveTarget.type === 'file' ? 'File' : 'Folder'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{moveTarget.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMoveModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-2 max-h-60 overflow-y-auto pr-1">
          {/* Destination: Root */}
          <div
            onClick={() => setSelectedDestinationId(null)}
            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-semibold transition-colors ${
              selectedDestinationId === null
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-brand-600" />
              <span>My Drive (Root)</span>
            </div>
            {selectedDestinationId === null && <Check className="w-4 h-4 text-brand-600" />}
          </div>

          {/* Folder Options */}
          {availableFolders.map(folder => (
            <div
              key={folder.id}
              onClick={() => setSelectedDestinationId(folder.id)}
              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-semibold transition-colors ${
                selectedDestinationId === folder.id
                  ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Folder className="w-4 h-4 shrink-0" style={{ color: folder.color || '#4f46e5' }} />
                <span className="truncate">{folder.name}</span>
              </div>
              {selectedDestinationId === folder.id && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsMoveModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-colors"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};
