import React, { useState, useEffect } from 'react';
import { PublicTransitLine } from '../../types/traffic';
import { api } from '../../services/api';
import {
  Bus,
  Train,
  TrainTrack,
  Search,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  MapPin,
  Ticket,
  ArrowRight
} from 'lucide-react';

export const TransitView: React.FC = () => {
  const [transitLines, setTransitLines] = useState<PublicTransitLine[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'metro' | 'bus' | 'train'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLineId, setSelectedLineId] = useState<string>('metro-purple');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getPublicTransit()
      .then(lines => {
        setTransitLines(lines);
        if (lines.length > 0) setSelectedLineId(lines[0].id);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLines = transitLines.filter(line => {
    if (activeTab !== 'all' && line.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = line.lineName.toLowerCase().includes(q);
      const matchCode = line.routeCode.toLowerCase().includes(q);
      const matchOrigin = line.origin.toLowerCase().includes(q);
      const matchDest = line.destination.toLowerCase().includes(q);
      const matchStop = line.stops.some(s => s.name.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchOrigin && !matchDest && !matchStop) return false;
    }
    return true;
  });

  const selectedLine = transitLines.find(l => l.id === selectedLineId) || filteredLines[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Bus className="w-3.5 h-3.5" />
              BENGALURU PUBLIC TRANSIT TELEMETRY
            </div>
            <h1 className="text-2xl font-black text-white">Public Transport Schedules & Live Arrivals</h1>
            <p className="text-xs text-slate-300">
              Namma Metro lines, BMTC feeder & Vayu Vajra airport buses, and South Western suburban commuter trains.
            </p>
          </div>

          {/* Official External Links */}
          <div className="flex items-center gap-2">
            <a
              href="https://english.bmrc.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <span>Namma Metro Official</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
            <a
              href="https://mybmtc.karnataka.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <span>BMTC Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Disruption Alert Notice */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          <strong>Service Advisory:</strong> BMTC 500-D buses on Outer Ring Road are operating with a 20-30 minute delay due to severe waterlogging at Marathahalli underpass. Namma Metro Purple & Green lines running at normal 5-minute peak frequencies.
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center rounded-xl bg-navy-950 p-1 border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'metro', label: 'Namma Metro' },
            { id: 'bus', label: 'BMTC City Bus' },
            { id: 'train', label: 'Suburban Train' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-navy-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search stop, station, route (e.g. Whitefield, 500-D)..."
            className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Main Content Layout: Transit Lines List + Stop Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transit Lines Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Transit Lines ({filteredLines.length})
          </h3>

          <div className="space-y-3">
            {filteredLines.map(line => {
              const isSelected = selectedLine?.id === line.id;
              let Icon = Bus;
              if (line.type === 'metro') Icon = TrainTrack;
              if (line.type === 'train') Icon = Train;

              return (
                <div
                  key={line.id}
                  onClick={() => setSelectedLineId(line.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-navy-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                      : 'bg-navy-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                        style={{ backgroundColor: line.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white">{line.lineName}</div>
                        <div className="text-[11px] font-mono text-cyan-400 font-bold">{line.routeCode}</div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Every {line.frequencyMins}m
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[200px]">
                      {line.origin} ➔ {line.destination}
                    </span>
                    <span className="font-semibold text-emerald-400">{line.fareRange}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Line Timeline & Station Timings (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedLine ? (
            <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-6">
              {/* Line Header Details */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedLine.color }}
                    ></span>
                    <h2 className="text-lg font-black text-white">{selectedLine.lineName}</h2>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Route: <strong className="text-white font-mono">{selectedLine.routeCode}</strong></span>
                    <span>•</span>
                    <span>Total Stops: <strong className="text-white">{selectedLine.totalStops}</strong></span>
                    <span>•</span>
                    <span>Hours: <strong className="text-white">{selectedLine.operatingHours}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">
                    {selectedLine.status}
                  </div>
                </div>
              </div>

              {/* Station Stop Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-white">Route Stops & Estimated Wait</span>
                  <span className="font-mono text-cyan-400">● Live Simulated Arrivals</span>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
                  {selectedLine.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className="w-3 h-3 rounded-full border-2 border-navy-950"
                            style={{ backgroundColor: selectedLine.color }}
                          ></span>
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-2">
                            <span>{stop.name}</span>
                            {stop.isInterchange && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Interchange
                              </span>
                            )}
                          </div>
                          {stop.connections && (
                            <div className="text-[10px] text-slate-400">
                              Connects to: {stop.connections.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {stop.estimatedWaitMins} min wait
                        </div>
                        <div className="text-[10px] text-slate-500">Next Departure</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>
                  Arrivals represent calculated schedules with live simulated tracking offsets. For actual official reservations, consult BMRCL & BMTC portals.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-navy-900 border border-slate-800 text-slate-400 text-xs">
              No transit line selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
