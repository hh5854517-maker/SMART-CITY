import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  MapPin,
  ExternalLink,
  Plus
} from 'lucide-react';

export const MyReportsView: React.FC = () => {
  const { incidents, currentUser, setActivePage, setMapFocusCoordinates, updateIncidentStatus } = useTraffic();

  // Filter incidents reported by the current user or simulated for them
  const myIncidents = incidents.filter(
    i => i.reporterId === currentUser.id || i.reporterName?.includes(currentUser.name.split(' ')[0])
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            COMMUNITY CONTRIBUTIONS
          </div>
          <h1 className="text-2xl font-black text-white">My Submitted Incidents</h1>
          <p className="text-xs text-slate-300">
            Track verification progress, community upvotes, and resolution status for your road hazard reports.
          </p>
        </div>

        <button
          onClick={() => setActivePage('report')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Report New Incident
        </button>
      </div>

      {/* Reports List */}
      {myIncidents.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-navy-900 border border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Incidents Reported Yet</h3>
            <p className="text-xs text-slate-400">
              When you spot a traffic bottleneck, waterlogged underpass, or pothole, submit a report to help other commuters.
            </p>
          </div>
          <button
            onClick={() => setActivePage('report')}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs transition"
          >
            File First Traffic Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myIncidents.map(inc => {
            return (
              <div
                key={inc.id}
                className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-800 text-cyan-400 border border-cyan-500/30">
                        {inc.incidentType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          inc.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reported on {new Date(inc.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-white">{inc.title}</h3>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        inc.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : inc.status === 'resolved'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : inc.status === 'under_review'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      Status: {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

                {/* Progress Pipeline */}
                <div className="p-3 rounded-xl bg-navy-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span>1. Reported</span>
                    <span>2. Under Review</span>
                    <span>3. Verified / Confirmed</span>
                    <span>4. Cleared / Resolved</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-full ${
                        inc.status === 'resolved'
                          ? 'w-full bg-blue-500'
                          : inc.status === 'confirmed'
                          ? 'w-3/4 bg-emerald-500'
                          : inc.status === 'under_review'
                          ? 'w-1/2 bg-amber-500'
                          : 'w-1/4 bg-cyan-500'
                      }`}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {inc.addressText}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">
                      👍 <strong>{inc.upvotes || 1}</strong> Community Confirmations
                    </span>
                    <button
                      onClick={() => {
                        setMapFocusCoordinates([inc.latitude, inc.longitude]);
                        setActivePage('map');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold transition"
                    >
                      Locate on Map
                    </button>
                    {inc.status !== 'resolved' && (
                      <button
                        onClick={() => updateIncidentStatus(inc.id, 'resolved', 'Resolved by original reporter')}
                        className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-semibold transition"
                      >
                        Mark as Cleared
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
