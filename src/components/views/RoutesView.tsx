import React, { useState, useEffect } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { TrafficMap } from '../map/TrafficMap';
import { RouteAlternative } from '../../types/traffic';
import { api, BENGALURU_LANDMARKS } from '../../services/api';
import {
  Route as RouteIcon,
  Search,
  ArrowRight,
  ShieldAlert,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Car,
  Bike,
  Sparkles,
  Info
} from 'lucide-react';

export const RoutesView: React.FC = () => {
  const {
    routeOriginQuery,
    setRouteOriginQuery,
    routeDestinationQuery,
    setRouteDestinationQuery,
    incidents,
    currentUser,
    addNotification
  } = useTraffic();

  const [originName, setOriginName] = useState(routeOriginQuery || 'Central Silk Board Junction');
  const [destName, setDestName] = useState(routeDestinationQuery || 'Whitefield ITPL Main Road');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9176, lng: 77.6234 });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9863, lng: 77.7314 });

  const [preference, setPreference] = useState<'fastest' | 'avoid_congestion' | 'eco'>('avoid_congestion');
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showTurnByTurn, setShowTurnByTurn] = useState<boolean>(false);

  // Auto-suggest state
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);

  // Calculate routes on load or when parameters change
  const calculateRoutes = async (orig: { lat: number; lng: number; name: string }, dest: { lat: number; lng: number; name: string }) => {
    setIsCalculating(true);
    try {
      const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'rejected');
      const calculated = await api.findAlternativeRoutes(orig, dest, activeIncidents);
      setRoutes(calculated);
      setSelectedRouteIndex(0);
    } catch {
      addNotification('error', 'Routing Notice', 'Failed to calculate route geometry; using backup telemetry.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateRoutes({ ...originCoords, name: originName }, { ...destCoords, name: destName });
  }, []);

  const handleOriginSearch = async (val: string) => {
    setOriginName(val);
    setRouteOriginQuery(val);
    if (val.trim().length > 2) {
      const res = await api.searchAddresses(val);
      setOriginSuggestions(res);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestSearch = async (val: string) => {
    setDestName(val);
    setRouteDestinationQuery(val);
    if (val.trim().length > 2) {
      const res = await api.searchAddresses(val);
      setDestSuggestions(res);
    } else {
      setDestSuggestions([]);
    }
  };

  const handleSelectOrigin = (item: any) => {
    setOriginName(item.name);
    setRouteOriginQuery(item.name);
    setOriginCoords({ lat: item.lat, lng: item.lng });
    setOriginSuggestions([]);
    calculateRoutes({ lat: item.lat, lng: item.lng, name: item.name }, { ...destCoords, name: destName });
  };

  const handleSelectDest = (item: any) => {
    setDestName(item.name);
    setRouteDestinationQuery(item.name);
    setDestCoords({ lat: item.lat, lng: item.lng });
    setDestSuggestions([]);
    calculateRoutes({ ...originCoords, name: originName }, { lat: item.lat, lng: item.lng, name: item.name });
  };

  const handleSaveRoute = async () => {
    const currentRoute = routes[selectedRouteIndex];
    if (!currentRoute) return;

    try {
      await api.saveRoute({
        userId: currentUser.id,
        routeName: `${originName} to ${destName}`,
        originName,
        originLat: originCoords.lat,
        originLng: originCoords.lng,
        destinationName: destName,
        destinationLat: destCoords.lat,
        destinationLng: destCoords.lng,
        preferredRouteDetails: {
          distanceKm: currentRoute.distanceKm,
          averageDurationMins: currentRoute.durationMins,
          preferredMode: 'driving',
          via: currentRoute.via
        }
      });
      addNotification('success', 'Route Saved', `"${originName} to ${destName}" added to your saved commuter profile.`);
    } catch {
      addNotification('error', 'Save Failed', 'Could not save route to profile.');
    }
  };

  const activeRoute = routes[selectedRouteIndex];

  // Google Maps external link
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originName + ', Bengaluru'
  )}&destination=${encodeURIComponent(destName + ', Bengaluru')}&travelmode=driving`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Search & Preference Card */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <RouteIcon className="w-3.5 h-3.5" />
              AI COMMUTER CORRIDOR & ROUTING ENGINE
            </div>
            <h1 className="text-2xl font-black text-white mt-1">Discover Alternative Routes</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Mode:</span>
            <div className="flex items-center rounded-xl bg-navy-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setPreference('avoid_congestion')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  preference === 'avoid_congestion'
                    ? 'bg-cyan-500 text-navy-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Avoid Choke Points
              </button>
              <button
                onClick={() => setPreference('fastest')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  preference === 'fastest'
                    ? 'bg-cyan-500 text-navy-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Fastest Distance
              </button>
            </div>
          </div>
        </div>

        {/* Origin & Destination Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin Search */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Starting Location (Origin)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={originName}
                onChange={e => handleOriginSearch(e.target.value)}
                placeholder="Search origin junction or landmark..."
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {originSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-navy-950 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto text-xs">
                {originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOrigin(item)}
                    className="w-full text-left p-2.5 hover:bg-slate-800 text-slate-200 border-b border-slate-800/80 last:border-none"
                  >
                    <div className="font-bold text-white">{item.name}</div>
                    {item.area && <div className="text-[11px] text-slate-400">{item.area}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Search */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Destination (Target)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={destName}
                onChange={e => handleDestSearch(e.target.value)}
                placeholder="Search destination junction or landmark..."
                className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-navy-950 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto text-xs">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectDest(item)}
                    className="w-full text-left p-2.5 hover:bg-slate-800 text-slate-200 border-b border-slate-800/80 last:border-none"
                  >
                    <div className="font-bold text-white">{item.name}</div>
                    {item.area && <div className="text-[11px] text-slate-400">{item.area}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Hub Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-500">Common Bengaluru Commutes:</span>
          <button
            onClick={() => {
              setOriginName('Central Silk Board Junction');
              setDestName('Electronic City Phase 1');
              setOriginCoords({ lat: 12.9176, lng: 77.6234 });
              setDestCoords({ lat: 12.8452, lng: 77.6602 });
              calculateRoutes(
                { lat: 12.9176, lng: 77.6234, name: 'Central Silk Board Junction' },
                { lat: 12.8452, lng: 77.6602, name: 'Electronic City Phase 1' }
              );
            }}
            className="px-2.5 py-1 rounded-lg bg-navy-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition"
          >
            Silk Board ➔ Electronic City
          </button>
          <button
            onClick={() => {
              setOriginName('Hebbal Flyover Junction');
              setDestName('Kempegowda Int. Airport (BLR)');
              setOriginCoords({ lat: 13.0358, lng: 77.5970 });
              setDestCoords({ lat: 13.1986, lng: 77.7066 });
              calculateRoutes(
                { lat: 13.0358, lng: 77.5970, name: 'Hebbal Flyover Junction' },
                { lat: 13.1986, lng: 77.7066, name: 'Kempegowda Int. Airport (BLR)' }
              );
            }}
            className="px-2.5 py-1 rounded-lg bg-navy-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition"
          >
            Hebbal ➔ Airport Expressway
          </button>
          <button
            onClick={() => {
              setOriginName('Indiranagar 100 Feet Road');
              setDestName('Whitefield ITPL Main Road');
              setOriginCoords({ lat: 12.9784, lng: 77.6408 });
              setDestCoords({ lat: 12.9863, lng: 77.7314 });
              calculateRoutes(
                { lat: 12.9784, lng: 77.6408, name: 'Indiranagar 100 Feet Road' },
                { lat: 12.9863, lng: 77.7314, name: 'Whitefield ITPL Main Road' }
              );
            }}
            className="px-2.5 py-1 rounded-lg bg-navy-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition"
          >
            Indiranagar ➔ Whitefield
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map with Route Polyline + Alternative Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Container with Glowing Polyline (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Compass className="w-4 h-4 text-cyan-400" />
              Live Route Geometry & Hazard Corridor
            </span>
            <span className="font-mono text-cyan-400">
              {activeRoute ? `${activeRoute.distanceKm} km • ~${activeRoute.durationMins} mins` : ''}
            </span>
          </div>

          {/* Interactive Map with Polyline */}
          <TrafficMap
            height="500px"
            routeCoordinates={activeRoute?.coordinates}
            interactive={true}
          />

          {/* Mandatory Prompt Disclaimer Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Important Commuter Advisory:</strong> Travel durations are routing estimates generated via OSRM geometric calculations. While alternate routes circumvent known community-reported bottlenecks, variable monsoon rains and rapid signal changes mean no route can be strictly guaranteed to be faster or hazard-free.
            </div>
          </div>
        </div>

        {/* Right: Route Options & Decision Explanations (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Calculated Corridors ({routes.length})</h3>
            <span className="text-xs text-slate-400">Click to preview</span>
          </div>

          {/* Alternative Routes Cards */}
          <div className="space-y-3">
            {routes.map((r, idx) => {
              const isSelected = selectedRouteIndex === idx;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteIndex(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-navy-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                      : 'bg-navy-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{r.name}</span>
                        {r.recommended && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{r.summary}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-base text-cyan-400 font-mono">
                        {r.durationMins} <span className="text-xs font-sans text-slate-400">mins</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.distanceKm} km</div>
                    </div>
                  </div>

                  {/* Why this route is recommended / Warnings */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Corridor Cleanliness Score:</span>
                      <span
                        className={`font-bold ${
                          r.disruptionScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {r.disruptionScore}% Clear
                      </span>
                    </div>

                    {r.warnings.length > 0 ? (
                      <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/40 text-[11px] text-red-300 space-y-1">
                        <div className="font-semibold flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Reported Hazards on this Corridor:</span>
                        </div>
                        {r.warnings.map((w, wIdx) => (
                          <div key={wIdx} className="pl-4 text-slate-300">• {w}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-[11px] text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>No reported incidents along this corridor path.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons for Selected Route */}
          {activeRoute && (
            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveRoute}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-navy-950 hover:bg-slate-800 text-cyan-400 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save Route to Profile
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Turn-by-Turn Collapsible */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowTurnByTurn(!showTurnByTurn)}
                  className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-semibold py-1"
                >
                  <span>Turn-by-Turn Navigation Instructions ({activeRoute.steps.length})</span>
                  {showTurnByTurn ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTurnByTurn && (
                  <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                    {activeRoute.steps.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {sIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{st.instruction}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.distanceMeters} m • ~{Math.round(st.durationSeconds / 60)} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
