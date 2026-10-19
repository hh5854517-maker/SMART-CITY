import React, { useState } from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { FilesView } from './components/files/FilesView';
import { PhotoGalleryView } from './components/gallery/PhotoGalleryView';
import { FavoritesView } from './components/views/FavoritesView';
import { RecentView } from './components/views/RecentView';
import { TrashView } from './components/trash/TrashView';
import { StorageAnalyticsView } from './components/storage/StorageAnalyticsView';

// Modals & Overlays
import { GlobalDropzone } from './components/upload/GlobalDropzone';
import { UploadModal } from './components/upload/UploadModal';
import { CreateFolderModal } from './components/modals/CreateFolderModal';
import { RenameModal } from './components/modals/RenameModal';
import { MoveModal } from './components/modals/MoveModal';
import { ShareModal } from './components/modals/ShareModal';
import { CreateAlbumModal } from './components/modals/CreateAlbumModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { AuthModal } from './components/modals/AuthModal';
import { FilePreviewModal } from './components/preview/FilePreviewModal';

const MainAppContent: React.FC = () => {
  const { activeSection } = useVault();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'files':
        return <FilesView />;
      case 'photos':
      case 'albums':
        return <PhotoGalleryView />;
      case 'favorites':
        return <FavoritesView />;
      case 'recent':
        return <RecentView />;
      case 'trash':
        return <TrashView />;
      case 'storage':
        return <StorageAnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>

      {/* Global Windows Dropzone & Modals */}
      <GlobalDropzone />
      <UploadModal />
      <CreateFolderModal />
      <RenameModal />
      <MoveModal />
      <ShareModal />
      <CreateAlbumModal />
      <SettingsModal />
      <ShortcutsModal />
      <AuthModal />
      <FilePreviewModal />
    </div>
  );
};

export default function App() {
  return (
    <VaultProvider>
      <MainAppContent />
    </VaultProvider>
  );
}
