import React, { useState } from 'react';
import { useTraffic, DEMO_USERS } from '../../context/TrafficContext';
import { UserRole } from '../../types/traffic';
import {
  Menu,
  Bell,
  Search,
  Shield,
  UserCheck,
  Radio,
  ExternalLink,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentUser,
    switchUserRole,
    advisories,
    setActivePage,
    setSearchQuery,
    searchQuery,
    setAuthModalOpen
  } = useTraffic();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);

  const activeAdvisory = advisories.find(a => a.active);

  return (
    <header className="h-16 border-b border-slate-800 bg-navy-950/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between gap-4 z-30 sticky top-0">
      {/* Left: Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                SmartRoute AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4 Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-300 font-medium">Bengaluru Grid</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 hidden sm:inline">Real-time Telemetry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search / Filter input */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident, junction, or road (e.g. Silk Board, Hebbal, Marathahalli)..."
            className="w-full bg-navy-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Advisory banner, Role Switcher, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Urgent Advisory Alert Indicator */}
        {activeAdvisory && (
          <div className="relative">
            <button
              onClick={() => setAdvisoryOpen(!advisoryOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition"
              title="Active City Advisory"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden md:inline">Advisory Active</span>
            </button>

            {advisoryOpen && (
              <div className="absolute right-0 mt-2 w-80 p-3.5 rounded-2xl bg-navy-900 border border-amber-500/40 shadow-2xl z-50 text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {activeAdvisory.title}
                  </span>
                  <button onClick={() => setAdvisoryOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <p className="text-slate-300 leading-relaxed">{activeAdvisory.message}</p>
                <div className="pt-1 text-[11px] text-slate-500">
                  Issued by Bengaluru Municipal Traffic Control
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1-Click Role Switcher Dropdown (Allows evaluating all 3 roles easily) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition"
          >
            {currentUser.role === 'admin' ? (
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            ) : currentUser.role === 'warden' ? (
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
            <span className="font-semibold capitalize hidden sm:inline">{currentUser.role} View</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl z-50 text-xs space-y-1">
              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Switch Role / Persona:
              </div>

              {(['commuter', 'warden', 'admin'] as UserRole[]).map(r => {
                const u = DEMO_USERS[r];
                const active = currentUser.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      switchUserRole(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition ${
                      active ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{r} Mode</div>
                    </div>
                    {active && <span className="text-cyan-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Avatar & Profile Quick Jump */}
        <button
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-800/80 transition"
          title="Go to User Profile"
        >
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white truncate max-w-[120px]">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">Score: {currentUser.trustScore} pts</div>
          </div>
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/40"
          />
        </button>
      </div>
    </header>
  );
};
