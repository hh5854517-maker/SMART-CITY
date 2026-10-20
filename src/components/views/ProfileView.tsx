import React, { useState, useEffect } from 'react';
import { useTraffic, DEMO_USERS } from '../../context/TrafficContext';
import { SavedRoute, UserRole } from '../../types/traffic';
import { api } from '../../services/api';
import {
  User,
  Shield,
  Bookmark,
  Trash2,
  Route,
  Award,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, switchUserRole, planRouteFromDashboard, addNotification } = useTraffic();
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  const fetchSavedRoutes = async () => {
    setIsLoadingRoutes(true);
    try {
      const routes = await api.getSavedRoutes(currentUser.id);
      setSavedRoutes(routes);
    } catch {
      // Handled gracefully
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  useEffect(() => {
    fetchSavedRoutes();
  }, [currentUser]);

  const handleDeleteRoute = async (id: string, name: string) => {
    const success = await api.deleteSavedRoute(id, currentUser.id);
    if (success) {
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
      addNotification('info', 'Route Removed', `Deleted "${name}" from saved routes.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-cyan-500/30 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500 text-navy-950">
                {currentUser.role}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  {currentUser.email}
                </span>
                {currentUser.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    {currentUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-navy-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Community Trust</div>
              <div className="text-2xl font-black text-cyan-400 font-mono">{currentUser.trustScore} pts</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Rank Badge</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <Award className="w-4 h-4" />
                Bengaluru Sentinel
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher Sandbox for Testing */}
      <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tester Persona Switcher:
          </h3>
          <span className="text-[11px] text-slate-500">Instant Role Simulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['commuter', 'warden', 'admin'] as UserRole[]).map(r => {
            const u = DEMO_USERS[r];
            const active = currentUser.role === r;

            return (
              <button
                key={r}
                onClick={() => switchUserRole(r)}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">{u.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{r} Permissions</div>
                </div>
                {active && <span className="text-cyan-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Routes Section */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              Saved Daily Commutes ({savedRoutes.length})
            </h2>
            <p className="text-xs text-slate-400">
              One-click route recalculation to check live conditions before stepping out.
            </p>
          </div>
        </div>

        {savedRoutes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            No saved routes yet. Find an alternative route and click "Save Route to Profile".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRoutes.map(route => {
              const details = route.preferredRouteDetails || {};

              return (
                <div
                  key={route.id}
                  className="p-4 rounded-2xl bg-navy-950 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{route.routeName}</span>
                      <button
                        onClick={() => handleDeleteRoute(route.id, route.routeName)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition"
                        title="Delete Saved Route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 space-y-0.5 pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="truncate">{route.originName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="truncate">{route.destinationName}</span>
                      </div>
                    </div>

                    {details.via && (
                      <div className="text-[11px] text-cyan-400 pt-1">
                        Preferred via: {details.via}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {details.distanceKm ? `${details.distanceKm} km • ~${details.averageDurationMins}m` : 'Direct Route'}
                    </span>

                    <button
                      onClick={() => planRouteFromDashboard(route.originName, route.destinationName)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <span>Check Live</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
