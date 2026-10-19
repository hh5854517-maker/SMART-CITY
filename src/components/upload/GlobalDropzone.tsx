import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const GlobalDropzone: React.FC = () => {
  const { uploadFiles, activeFolderId, folders } = useVault();
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      // Only react to file drags
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounter++;
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDraggingOverWindow(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingOverWindow(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadFiles]);

  if (!isDraggingOverWindow) return null;

  const currentFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/75 backdrop-blur-md animate-fade-in pointer-events-none select-none">
      <div className="border-4 border-dashed border-brand-400 bg-white/10 dark:bg-black/30 rounded-3xl p-12 text-center max-w-md mx-4 animate-scale-in flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-brand-500 text-white flex items-center justify-center mb-4 shadow-xl shadow-brand-500/30 animate-bounce">
          <UploadCloud className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Drop Files to Upload
        </h2>
        <p className="text-sm text-brand-200 mt-2">
          Uploading directly into{' '}
          <span className="font-bold underline text-white">
            {currentFolder ? currentFolder.name : 'My Drive (Root)'}
          </span>
        </p>
      </div>
    </div>
  );
};
