import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { NavPage } from '../../types/traffic';
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Route,
  Bus,
  BarChart3,
  FileText,
  User,
  ShieldCheck,
  PhoneCall,
  Activity,
  ChevronRight,
  Radio
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activePage, setActivePage, incidents, currentUser } = useTraffic();

  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  const navItems: { id: NavPage; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string; adminOnly?: boolean }[] = [
    { id: 'overview', label: 'Home / Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Traffic Map', icon: MapPin, badge: activeIncidentsCount, badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'report', label: 'Report Incident', icon: AlertTriangle, badge: 'Live', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { id: 'routes', label: 'Alternative Routes', icon: Route },
    { id: 'transit', label: 'Public Transport', icon: Bus },
    { id: 'analytics', label: 'Traffic Analytics', icon: BarChart3 },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'profile', label: 'User Profile & Routes', icon: User },
    {
      id: 'admin',
      label: 'Admin Moderation',
      icon: ShieldCheck,
      badge: currentUser.role === 'admin' || currentUser.role === 'warden' ? 'Duty' : 'Demo',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  ];

  const handleNavClick = (id: NavPage) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Commuter Platform
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Grid Health Widget at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-navy-900/60">
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Network Status
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-navy-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Active Hazards</div>
                <div className="font-extrabold text-white text-sm">{activeIncidentsCount}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-navy-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Critical Alerts</div>
                <div className="font-extrabold text-red-400 text-sm">{criticalCount}</div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
              <span>Traffic Police Hotline:</span>
              <span className="font-mono font-bold text-cyan-400">103 / 112</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
