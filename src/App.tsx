import React, { useState } from 'react';
import { TrafficProvider, useTraffic } from './context/TrafficContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/modals/AuthModal';

// Views
import { OverviewView } from './components/views/OverviewView';
import { LiveMapView } from './components/views/LiveMapView';
import { ReportIncidentView } from './components/views/ReportIncidentView';
import { RoutesView } from './components/views/RoutesView';
import { TransitView } from './components/views/TransitView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { MyReportsView } from './components/views/MyReportsView';
import { ProfileView } from './components/views/ProfileView';
import { AdminView } from './components/views/AdminView';

const MainAppContent: React.FC = () => {
  const { activePage } = useTraffic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewView />;
      case 'map':
        return <LiveMapView />;
      case 'report':
        return <ReportIncidentView />;
      case 'routes':
        return <RoutesView />;
      case 'transit':
        return <TransitView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'my-reports':
        return <MyReportsView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return <AdminView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <TrafficProvider>
      <MainAppContent />
    </TrafficProvider>
  );
}
