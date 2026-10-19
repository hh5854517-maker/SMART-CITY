import React from 'react';
import { ChevronRight, HardDrive, Folder } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const Breadcrumbs: React.FC = () => {
  const { folderBreadcrumbs, setActiveFolderId, activeFolderId, files, folders } = useVault();

  // Count files and folders inside active folder
  const currentFilesCount = files.filter(f => f.folderId === activeFolderId && !f.isTrash).length;
  const currentFoldersCount = folders.filter(fd => fd.parentId === activeFolderId && !fd.isTrash).length;

  return (
    <div className="flex items-center justify-between py-3 px-1 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 select-none">
      <nav className="flex items-center gap-1.5 text-sm overflow-x-auto no-scrollbar">
        {/* Root Button */}
        <button
          onClick={() => setActiveFolderId(null)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
            activeFolderId === null
              ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>My Drive</span>
        </button>

        {folderBreadcrumbs.map((crumb, index) => {
          const isLast = index === folderBreadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              <button
                onClick={() => setActiveFolderId(crumb.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors font-medium truncate max-w-[160px] ${
                  isLast
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Folder
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: crumb.color || '#4f46e5' }}
                />
                <span className="truncate">{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Item summary counter */}
      <div className="hidden sm:flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        <span>
          {currentFoldersCount > 0 ? `${currentFoldersCount} folder${currentFoldersCount > 1 ? 's' : ''}, ` : ''}
          {currentFilesCount} file{currentFilesCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
