import React, { useState, useEffect } from 'react';
import { TrafficStats } from '../../types/traffic';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Flame,
  Activity,
  Layers
} from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981'
};

const CATEGORY_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#eab308'];

export const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAnalytics()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="p-16 text-center text-slate-400">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-xs">Aggregating smart city telemetry and corridor analytics...</p>
      </div>
    );
  }

  // Format data for Recharts
  const categoryData = Object.entries(stats.byType).map(([type, count]) => ({
    type: type.toUpperCase(),
    count
  }));

  const severityData = Object.entries(stats.bySeverity).map(([severity, count]) => ({
    name: severity.toUpperCase(),
    value: count,
    color: SEVERITY_COLORS[severity] || '#06b6d4'
  }));

  const corridorData = stats.corridorCongestion.map(c => ({
    name: c.name,
    delay: c.delayMins,
    speed: c.speedKmh,
    normal: c.normalSpeedKmh
  }));

  // CSV Export
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Active Incidents,${stats.totalActive}\n` +
      `Total Reported Lifetime,${stats.totalReported}\n` +
      `Congestion Hotspots,${stats.congestionHotspots}\n` +
      `Road Hazards / Accidents,${stats.hazardsCount}\n` +
      `Resolved Today,${stats.resolvedToday}\n` +
      `Average Disruption Minutes,${stats.averageDisruptionMins}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartroute-traffic-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" />
              MUNICIPAL TRAFFIC INTELLIGENCE & TELEMETRY
            </div>
            <h1 className="text-2xl font-black text-white">Incident Analytics & Traffic Summaries</h1>
            <p className="text-xs text-slate-300">
              Aggregated metrics, corridor crawl speeds, hazard category distributions, and daily congestion curves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-navy-950 border border-slate-700 hover:border-cyan-500 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Export CSV Report
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Road Disruptions</span>
          <div className="text-3xl font-black text-cyan-400 font-mono">{stats.totalActive}</div>
          <span className="text-[11px] text-slate-400">Live across Bengaluru grid</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Average Corridor Delay</span>
          <div className="text-3xl font-black text-amber-400 font-mono">+{stats.averageDisruptionMins}m</div>
          <span className="text-[11px] text-slate-400">Peak hour waiting time</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Severe Choke Points</span>
          <div className="text-3xl font-black text-orange-400 font-mono">{stats.congestionHotspots}</div>
          <span className="text-[11px] text-slate-400">Bottlenecks needing detours</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Resolved Today</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">{stats.resolvedToday}</div>
          <span className="text-[11px] text-slate-400">Clearance rate 86%</span>
        </div>
      </div>

      {/* Charts Grid Row 1: Hourly Trends Area Chart + Severity Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Congestion Trend (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-white">Daily Commuter Disruption Curve</h3>
              <p className="text-xs text-slate-400">Hourly congestion index (0-100) and reported hazard spikes</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Peak: 10:00 & 18:00</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="congestionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223055', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="congestionLevel"
                  name="Congestion Level"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#congestionGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Donut (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-white">Incident Severity Distribution</h3>
            <p className="text-xs text-slate-400">Critical vs High vs Moderate proportion</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223055', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {severityData.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-300 font-medium">{s.name}:</span>
                <span className="font-mono font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Category Bar Chart + Corridor Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incidents by Category (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Incidents by Hazard Category</h3>
            <span className="text-xs text-slate-400">Database Records</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223055', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Affected Corridors Crawl Speed (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-navy-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Top Bengaluru Choke Points & Crawl Speed</h3>
            <span className="text-xs text-red-400 font-semibold font-mono">Current km/h vs Normal</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
            {stats.corridorCongestion.map((c, i) => {
              const speedRatio = Math.round((c.speedKmh / c.normalSpeedKmh) * 100);

              return (
                <div key={i} className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-red-400 font-bold font-mono">+{c.delayMins} min delay</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Speed: <strong className="text-cyan-400">{c.speedKmh} km/h</strong> (Normal: {c.normalSpeedKmh} km/h)</span>
                    <span className="font-bold text-amber-400">{speedRatio}% of capacity</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.status === 'red' ? 'bg-red-500' : c.status === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(15, speedRatio)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
