import React, { useState } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { TrafficMap } from '../map/TrafficMap';
import {
  Filter,
  List,
  Map as MapIcon,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ThumbsUp,
  Search,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { IncidentType, SeverityLevel, IncidentStatus } from '../../types/traffic';

export const LiveMapView: React.FC = () => {
  const {
    filteredIncidents,
    filterType,
    setFilterType,
    filterSeverity,
    setFilterSeverity,
    filterStatus,
    setFilterStatus,
    filterVerification,
    setFilterVerification,
    searchQuery,
    setSearchQuery,
    upvoteIncident,
    setMapFocusCoordinates,
    currentUser,
    updateIncidentStatus
  } = useTraffic();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Controls & Filters Header */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Live Traffic Map & Incidents</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {filteredIncidents.length} Visible
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive geographic map displaying accidents, waterlogging, congestion bottlenecks, and road closures in Bengaluru.
            </p>
          </div>

          {/* Mode Switcher: Map vs Accessible List */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-navy-950 p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'map' ? 'bg-cyan-500 text-navy-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'list' ? 'bg-cyan-500 text-navy-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Accessible List
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="bg-navy-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Incident Types</option>
            <option value="accident">Accidents</option>
            <option value="congestion">Traffic Congestion</option>
            <option value="flooding">Flooding / Waterlogging</option>
            <option value="closure">Road Closures</option>
            <option value="pothole">Potholes</option>
            <option value="breakdown">Breakdowns</option>
            <option value="hazard">Hazards</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as any)}
            className="bg-navy-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-navy-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed / Verified</option>
            <option value="reported">Reported / Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Verification Filter */}
          <select
            value={filterVerification}
            onChange={e => setFilterVerification(e.target.value as any)}
            className="bg-navy-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Verifications</option>
            <option value="verified">Official / Verified Only</option>
            <option value="community">Community Reports</option>
          </select>

          {(filterType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all' || filterVerification !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterSeverity('all');
                setFilterStatus('all');
                setFilterVerification('all');
                setSearchQuery('');
              }}
              className="text-cyan-400 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Simulated Telemetry Notice as required by prompt */}
      <div className="px-4 py-2 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            <strong>Data Disclosure:</strong> Live conditions are derived from verified police feeds, community crowdsourcing, and simulated telemetry sensors for demonstration.
          </span>
        </div>
        <span className="font-mono text-[11px] text-blue-400 whitespace-nowrap">OSM / PostGIS</span>
      </div>

      {/* Map or Accessible List Display */}
      {viewMode === 'map' ? (
        <TrafficMap height="640px" interactive={true} />
      ) : (
        <div className="space-y-3">
          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-base">No Incidents Matching Selected Filters</h3>
              <p className="text-xs text-slate-400">All roads in this category are operating smoothly with normal flow.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIncidents.map(inc => (
                <div
                  key={inc.id}
                  className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                          inc.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : inc.severity === 'high'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inc.severity}
                      </span>

                      {inc.verificationState === 'verified' ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          Community ({inc.upvotes} votes)
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-white">{inc.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{inc.description}</p>

                    {inc.photoUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-800">
                        <img src={inc.photoUrl} alt={inc.title} className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">📍 {inc.addressText}</span>
                      {inc.estimatedDelayMinutes ? (
                        <span className="text-red-400 font-semibold font-mono">+{inc.estimatedDelayMinutes}m delay</span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => upvoteIncident(inc.id)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Confirm ({inc.upvotes || 1})
                      </button>
                      <button
                        onClick={() => {
                          setMapFocusCoordinates([inc.latitude, inc.longitude]);
                          setViewMode('map');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition"
                      >
                        Pin On Map
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
