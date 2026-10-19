import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  Folder,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatBytes } from '../../lib/utils';

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadQueue,
    uploadFiles,
    clearCompletedUploads,
    activeFolderId,
    folders,
  } = useVault();

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const currentFolder = folders.find(f => f.id === activeFolderId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = ''; // reset so same files can be re-selected
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Upload Files to FileVault
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Target:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {currentFolder ? currentFolder.name : 'My Drive (Root)'}
              </span>
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-4 ring-brand-500/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Drag & Drop your files here, or <span className="text-brand-600 dark:text-brand-400 underline">browse</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Supports Photos (JPG, PNG, WEBP), Videos (MP4), Documents (PDF, TXT, DOCX), Audio (MP3), & Archives.
            </p>
          </div>
        </div>

        {/* Upload Progress Queue List */}
        {uploadQueue.length > 0 && (
          <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-3 min-h-[140px]">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Upload Queue ({uploadQueue.length})</span>
              <button
                onClick={clearCompletedUploads}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear completed
              </button>
            </div>

            <div className="space-y-2">
              {uploadQueue.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shrink-0">
                    {item.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                        {item.name}
                      </p>
                      <span className="font-mono text-slate-400 shrink-0">
                        {formatBytes(item.size)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.status === 'error'
                            ? 'bg-rose-500'
                            : item.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-brand-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    {item.error && (
                      <p className="text-[10px] text-rose-500 mt-1 font-medium">
                        {item.error}
                      </p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 pl-1">
                    {item.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                    {item.status === 'uploading' && (
                      <RotateCw className="w-4 h-4 text-brand-500 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Files are verified & encrypted in your private bucket
          </span>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
