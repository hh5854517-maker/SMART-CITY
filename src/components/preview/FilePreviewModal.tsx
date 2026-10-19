import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  Copy,
  Check,
  Calendar,
  HardDrive,
  Info,
  Folder,
  Music,
  Video,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { formatBytes, formatDate, formatDateTime, downloadFile } from '../../lib/utils';

export const FilePreviewModal: React.FC = () => {
  const {
    activePreviewFile,
    closePreview,
    navigatePreview,
    toggleFavoriteFile,
    openShareModal,
    folders,
  } = useVault();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedText, setCopiedText] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  // Reset zoom & rotation when activePreviewFile changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setCopiedText(false);
  }, [activePreviewFile?.id]);

  // Keyboard navigation: Left, Right, Escape
  useEffect(() => {
    if (!activePreviewFile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
      } else if (e.key === 'ArrowRight') {
        navigatePreview('next');
      } else if (e.key === 'ArrowLeft') {
        navigatePreview('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePreviewFile, closePreview, navigatePreview]);

  if (!activePreviewFile) return null;

  const currentFolder = folders.find(f => f.id === activePreviewFile.folderId);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleCopyText = () => {
    if (activePreviewFile.description) {
      navigator.clipboard.writeText(activePreviewFile.description);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-4 md:px-6 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold text-white text-sm md:text-base truncate max-w-sm md:max-w-md">
            {activePreviewFile.name}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">
            {formatBytes(activePreviewFile.size)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activePreviewFile.category === 'image' && (
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 mr-2 text-white">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs px-2 font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => toggleFavoriteFile(activePreviewFile.id)}
            className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
              activePreviewFile.isFavorite
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Star Favorite"
          >
            <Star className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => openShareModal(activePreviewFile)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            title="Share File"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => downloadFile(activePreviewFile.url, activePreviewFile.name)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow transition-colors"
            title="Download File"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={() => setShowInfoSidebar(prev => !prev)}
            className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
              showInfoSidebar ? 'bg-white/30 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Toggle File Details"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={closePreview}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows for Previous/Next */}
      <button
        onClick={() => navigatePreview('prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-colors"
        title="Previous (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => navigatePreview('next')}
        className="absolute right-4 md:right-80 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-colors"
        title="Next (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Preview Container */}
      <div className={`flex-1 h-full flex items-center justify-center p-6 md:p-12 overflow-hidden transition-all ${showInfoSidebar ? 'md:pr-80' : ''}`}>
        {/* Images */}
        {activePreviewFile.category === 'image' && (
          <div className="relative max-w-full max-h-full flex items-center justify-center overflow-auto">
            <img
              src={activePreviewFile.url}
              alt={activePreviewFile.name}
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out',
              }}
              className="max-h-[82vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Videos */}
        {activePreviewFile.category === 'video' && (
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <video
              src={activePreviewFile.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Audio */}
        {activePreviewFile.category === 'audio' && (
          <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Music className="w-12 h-12 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white truncate">
                {activePreviewFile.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {formatBytes(activePreviewFile.size)} • High-Fidelity Audio
              </p>
            </div>
            <audio src={activePreviewFile.url} controls className="w-full" />
          </div>
        )}

        {/* PDF Document */}
        {activePreviewFile.category === 'document' && activePreviewFile.type === 'application/pdf' && (
          <div className="w-full max-w-4xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <iframe
              src={activePreviewFile.url}
              title={activePreviewFile.name}
              className="w-full h-full border-none"
            />
          </div>
        )}

        {/* Text / Markdown Document */}
        {activePreviewFile.category === 'document' && activePreviewFile.type !== 'application/pdf' && (
          <div className="w-full max-w-3xl max-h-[80vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-left">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                {activePreviewFile.name}
              </span>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy Content'}</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {activePreviewFile.description || 'No text content available to display.'}
            </div>
          </div>
        )}

        {/* Other / Archives */}
        {activePreviewFile.category !== 'image' &&
          activePreviewFile.category !== 'video' &&
          activePreviewFile.category !== 'audio' &&
          activePreviewFile.category !== 'document' && (
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl text-center max-w-md space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white truncate">
                {activePreviewFile.name}
              </h3>
              <p className="text-xs text-slate-400">
                Direct in-browser preview is not supported for this file format. You can download the file to inspect it on your local device.
              </p>
              <button
                onClick={() => downloadFile(activePreviewFile.url, activePreviewFile.name)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Download File
              </button>
            </div>
          )}
      </div>

      {/* Right File Information Sidebar */}
      {showInfoSidebar && (
        <aside className="absolute right-0 top-16 bottom-0 w-80 bg-slate-900/95 border-l border-white/10 backdrop-blur-xl p-5 overflow-y-auto space-y-6 z-20 text-slate-200 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-sm text-white mb-1">
              File Details
            </h3>
            <p className="text-[11px] text-slate-400">
              Metadata and storage attributes
            </p>
          </div>

          <div className="space-y-4 border-t border-white/10 pt-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Filename</span>
              <p className="font-medium text-white break-words mt-0.5">{activePreviewFile.name}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">File Size</span>
              <p className="font-mono text-white mt-0.5">{formatBytes(activePreviewFile.size)}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">MIME Format</span>
              <p className="font-mono text-white mt-0.5">{activePreviewFile.type}</p>
            </div>

            {activePreviewFile.dimensions && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Dimensions</span>
                <p className="font-mono text-white mt-0.5">
                  {activePreviewFile.dimensions.width} × {activePreviewFile.dimensions.height} px
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Location</span>
              <p className="text-white mt-0.5 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-brand-400" />
                <span>{currentFolder ? currentFolder.name : 'Root (My Drive)'}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Uploaded Date</span>
              <p className="text-white mt-0.5">{formatDateTime(activePreviewFile.createdAt)}</p>
            </div>

            {activePreviewFile.description && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Description / Notes</span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/10 text-[11px]">
                  {activePreviewFile.description}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => openShareModal(activePreviewFile)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Secure Link</span>
            </button>
            <button
              onClick={() => downloadFile(activePreviewFile.url, activePreviewFile.name)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
