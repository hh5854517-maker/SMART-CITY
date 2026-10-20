import React, { useState } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { TrafficMap } from '../map/TrafficMap';
import {
  AlertTriangle,
  Flame,
  Route,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Compass,
  Bus,
  Search,
  Sparkles,
  ChevronRight,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';
import { BENGALURU_LANDMARKS } from '../../services/api';

export const OverviewView: React.FC = () => {
  const {
    incidents,
    setActivePage,
    planRouteFromDashboard,
    upvoteIncident,
    setMapFocusCoordinates
  } = useTraffic();

  const [originInput, setOriginInput] = useState('Central Silk Board Junction');
  const [destInput, setDestInput] = useState('Whitefield ITPL Main Road');

  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected');
  const accidentsHazards = activeIncidents.filter(i => ['accident', 'hazard', 'flooding'].includes(i.incidentType));
  const congestionCount = activeIncidents.filter(i => i.incidentType === 'congestion');
  const resolvedToday = incidents.filter(i => i.status === 'resolved').length;

  const handleQuickRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originInput.trim() || !destInput.trim()) return;
    planRouteFromDashboard(originInput, destInput);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome & City Grid Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              BENGALURU SMART COMMUTER INTELLIGENCE
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Monitor Live Traffic, Avoid Bottlenecks & Navigate Smartly
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time crowdsourced road hazards, turn-by-turn routing estimates, official transit schedules, and municipal traffic moderation for Karnataka commuters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('report')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 flex items-center gap-2 transition transform active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Road Hazard
            </button>
            <button
              onClick={() => setActivePage('routes')}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition transform active:scale-95"
            >
              <Route className="w-4 h-4" />
              Find Alternative Routes
            </button>
          </div>
        </div>
      </div>

      {/* Traffic Condition Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Active Incidents */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{activeIncidents.length}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">{incidents.filter(i => i.severity === 'critical').length} Critical</span>
            <span>across city corridor</span>
          </div>
        </div>

        {/* Card 2: Congestion Hotspots */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Congestion Choke</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-orange-400">{congestionCount.length}</div>
          <div className="text-[11px] text-slate-400">
            Silk Board & ORR high delays
          </div>
        </div>

        {/* Card 3: Accidents & Hazards */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Accidents / Floods</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-red-400">{accidentsHazards.length}</div>
          <div className="text-[11px] text-slate-400">
            Field patrol cranes dispatched
          </div>
        </div>

        {/* Card 4: Resolved Today */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-400">{resolvedToday}</div>
          <div className="text-[11px] text-slate-400">
            Normal flow restored
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Quick Route Finder & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Focus (7 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h2 className="font-extrabold text-sm md:text-base text-white">Live Road Network & Choke Points</h2>
            </div>
            <button
              onClick={() => setActivePage('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
            >
              Open Fullscreen Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Leaflet Map Component */}
          <TrafficMap height="460px" interactive={true} />

          {/* Severity Status Indicator Pills */}
          <div className="p-3 rounded-2xl bg-navy-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-400">Congestion Levels:</span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Green: Flowing / Low</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Yellow: Moderate Crawl</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Orange: Heavy Bottleneck</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Red: Critical Gridlock / Closure</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Route Widget + Recent Incidents Feed (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Route Search Box */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Find Alternative Route</h3>
              </div>
              <span className="text-[11px] text-cyan-400 font-mono">OSRM Engine</span>
            </div>

            <form onSubmit={handleQuickRouteSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Starting Point</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500"></span>
                  <input
                    type="text"
                    value={originInput}
                    onChange={e => setOriginInput(e.target.value)}
                    placeholder="Enter origin junction..."
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destination</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500"></span>
                  <input
                    type="text"
                    value={destInput}
                    onChange={e => setDestInput(e.target.value)}
                    placeholder="Enter destination..."
                    className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition"
              >
                <span>Calculate Best Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Popular:</span>
              <button
                onClick={() => {
                  setOriginInput('Hebbal Flyover Junction');
                  setDestInput('Kempegowda Int. Airport (BLR)');
                }}
                className="text-cyan-400 hover:underline"
              >
                Hebbal ➔ Airport
              </button>
              <button
                onClick={() => {
                  setOriginInput('Central Silk Board Junction');
                  setDestInput('Electronic City Phase 1');
                }}
                className="text-cyan-400 hover:underline"
              >
                Silk Board ➔ E-City
              </button>
            </div>
          </div>

          {/* Recently Reported Incidents Feed */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Recent Reports</h3>
              </div>
              <button
                onClick={() => setActivePage('map')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                View all ({incidents.length})
              </button>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {incidents.slice(0, 5).map(inc => {
                const isCritical = inc.severity === 'critical';
                const isHigh = inc.severity === 'high';

                return (
                  <div
                    key={inc.id}
                    className="p-3 rounded-xl bg-navy-950/80 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCritical
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : isHigh
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {inc.severity}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {inc.incidentType}
                        </span>
                      </div>

                      {inc.verificationState === 'verified' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                          Community ({inc.upvotes || 1})
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{inc.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[170px]">{inc.addressText}</span>
                      <button
                        onClick={() => {
                          setMapFocusCoordinates([inc.latitude, inc.longitude]);
                          setActivePage('map');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5"
                      >
                        Locate ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
