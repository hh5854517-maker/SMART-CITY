import React, { useState, useEffect } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { Incident, IncidentStatus, IncidentUpdate } from '../../types/traffic';
import { api } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  History,
  Radio,
  Clock,
  Filter,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    incidents,
    updateIncidentStatus,
    addAdvisory,
    addNotification,
    setMapFocusCoordinates,
    setActivePage
  } = useTraffic();

  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'confirmed' | 'resolved' | 'rejected'>('pending');
  const [auditLogs, setAuditLogs] = useState<IncidentUpdate[]>([]);
  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryMessage, setAdvisoryMessage] = useState('');
  const [advisorySeverity, setAdvisorySeverity] = useState<'info' | 'warning' | 'alert'>('warning');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Status notes modal state
  const [selectedIncidentForUpdate, setSelectedIncidentForUpdate] = useState<Incident | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<IncidentStatus>('confirmed');

  useEffect(() => {
    // Fetch audit logs
    fetch('/api/incidents-updates')
      .then(res => res.json())
      .then(setAuditLogs)
      .catch(() => {});
  }, [incidents]);

  const isAuthorized = currentUser.role === 'admin' || currentUser.role === 'warden';

  const filteredQueue = incidents.filter(i => {
    if (queueFilter === 'pending') return i.status === 'reported' || i.status === 'under_review';
    if (queueFilter === 'confirmed') return i.status === 'confirmed';
    if (queueFilter === 'resolved') return i.status === 'resolved';
    if (queueFilter === 'rejected') return i.status === 'rejected';
    return true;
  });

  const handleOpenActionModal = (inc: Incident, status: IncidentStatus) => {
    setSelectedIncidentForUpdate(inc);
    setTargetStatus(status);
    setUpdateNotes(`Status transitioned to ${status} following on-ground verification.`);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedIncidentForUpdate) return;
    await updateIncidentStatus(selectedIncidentForUpdate.id, targetStatus, updateNotes);
    setSelectedIncidentForUpdate(null);
  };

  const handleBroadcastAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryTitle.trim() || !advisoryMessage.trim()) return;

    setIsBroadcasting(true);
    try {
      await addAdvisory({
        title: advisoryTitle.trim(),
        message: advisoryMessage.trim(),
        severity: advisorySeverity
      });
      setAdvisoryTitle('');
      setAdvisoryMessage('');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              MUNICIPAL TRAFFIC POLICE & MODERATION DESK
            </div>
            <h1 className="text-2xl font-black text-white">Incident Verification & Moderation</h1>
            <p className="text-xs text-slate-300">
              Review community reports, verify real incidents, reject fraudulent submissions, and broadcast city advisories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthorized ? (
              <button
                onClick={() => switchUserRole('admin')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
              >
                <span>Switch to Municipal Admin Mode</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Moderation Powers Active ({currentUser.role})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Moderation Queue (8 Cols) + Advisory Broadcast & Audit Log (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue Filter & Incident Review Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Queue Filter Bar */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-400 font-semibold mr-1">Queue:</span>
              {[
                { id: 'pending', label: 'Pending Review', count: incidents.filter(i => i.status === 'reported' || i.status === 'under_review').length },
                { id: 'confirmed', label: 'Confirmed / Verified', count: incidents.filter(i => i.status === 'confirmed').length },
                { id: 'resolved', label: 'Resolved / Cleared', count: incidents.filter(i => i.status === 'resolved').length },
                { id: 'rejected', label: 'Rejected Spam', count: incidents.filter(i => i.status === 'rejected').length },
                { id: 'all', label: 'All Incidents', count: incidents.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setQueueFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    queueFilter === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-navy-950'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Incident Queue Cards */}
          <div className="space-y-3">
            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 text-slate-400 text-xs">
                No incidents in this moderation queue filter.
              </div>
            ) : (
              filteredQueue.map(inc => (
                <div
                  key={inc.id}
                  className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                        Submitted by: <strong className="text-white">{inc.reporterName || 'Commuter'}</strong>
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        inc.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : inc.status === 'resolved'
                          ? 'bg-blue-500/20 text-blue-400'
                          : inc.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white">{inc.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

                  {inc.photoUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 max-w-xs">
                      <img src={inc.photoUrl} alt={inc.title} className="w-full h-28 object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400 flex items-center gap-2">
                      <span>📍 {inc.addressText}</span>
                      <span>•</span>
                      <span>👍 {inc.upvotes} Confirmations</span>
                    </div>

                    {/* Moderation Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMapFocusCoordinates([inc.latitude, inc.longitude]);
                          setActivePage('map');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-navy-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold"
                      >
                        Inspect Pin
                      </button>

                      {isAuthorized ? (
                        <>
                          {inc.status !== 'confirmed' && (
                            <button
                              onClick={() => handleOpenActionModal(inc, 'confirmed')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verify & Confirm
                            </button>
                          )}

                          {inc.status !== 'resolved' && (
                            <button
                              onClick={() => handleOpenActionModal(inc, 'resolved')}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                            >
                              Resolve
                            </button>
                          )}

                          {inc.status !== 'rejected' && (
                            <button
                              onClick={() => handleOpenActionModal(inc, 'rejected')}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40 font-bold text-xs flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject Spam
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => switchUserRole('admin')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold"
                        >
                          Enable Admin Role to Moderate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: City-Wide Advisory Broadcast Tool + Audit Trail (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Advisory Broadcast Form */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white">Broadcast City Traffic Advisory</h3>
            </div>
            <p className="text-xs text-slate-400">
              Immediately alerts all connected commuters and flashes top priority warning banner across the platform.
            </p>

            <form onSubmit={handleBroadcastAdvisory} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Advisory Headline</label>
                <input
                  type="text"
                  value={advisoryTitle}
                  onChange={e => setAdvisoryTitle(e.target.value)}
                  placeholder="e.g. Heavy Rain Alert: Avoid South Bengaluru Underpasses"
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  disabled={!isAuthorized}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Advisory Message</label>
                <textarea
                  rows={3}
                  value={advisoryMessage}
                  onChange={e => setAdvisoryMessage(e.target.value)}
                  placeholder="Provide detour recommendations and expected clearance times..."
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  disabled={!isAuthorized}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={advisorySeverity}
                  onChange={e => setAdvisorySeverity(e.target.value as any)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  disabled={!isAuthorized}
                >
                  <option value="warning">Warning (Amber Alert)</option>
                  <option value="alert">Critical Emergency (Red Alert)</option>
                  <option value="info">Informational Note (Cyan Notice)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!isAuthorized || isBroadcasting}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Broadcast Alert</span>
              </button>
            </form>
          </div>

          {/* Audit Trail Log */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white">Status Transition Audit Trail</h3>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No moderation changes logged yet.</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">{log.updatedByName || 'Admin'}</span>
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[11px] text-cyan-400">
                      {log.previousStatus} ➔ <strong>{log.newStatus}</strong>
                    </div>
                    {log.notes && <div className="text-[10px] text-slate-400">{log.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Transition Dialog */}
      {selectedIncidentForUpdate && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-navy-900 border border-purple-500/40 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Confirm Incident Status Transition</h3>
              <p className="text-xs text-slate-400">
                Updating: <strong className="text-white">{selectedIncidentForUpdate.title}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Target Status</label>
              <select
                value={targetStatus}
                onChange={e => setTargetStatus(e.target.value as IncidentStatus)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="confirmed">Confirmed (Verified by Dispatcher)</option>
                <option value="resolved">Resolved (Normal Flow Restored)</option>
                <option value="under_review">Under Review (Patrol En Route)</option>
                <option value="rejected">Rejected (False Report / Spam)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Log Dispatch Note</label>
              <textarea
                rows={3}
                value={updateNotes}
                onChange={e => setUpdateNotes(e.target.value)}
                placeholder="Details of verification or resolution..."
                className="w-full bg-navy-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmStatusChange}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                Save & Log Update
              </button>
              <button
                onClick={() => setSelectedIncidentForUpdate(null)}
                className="px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
