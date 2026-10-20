import React from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useTraffic();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map(n => {
        let icon = <Info className="w-5 h-5 text-cyan-400" />;
        let border = 'border-cyan-500/40';
        let bg = 'bg-navy-900/95';

        if (n.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          border = 'border-emerald-500/40';
        } else if (n.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          border = 'border-amber-500/40';
        } else if (n.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-400" />;
          border = 'border-red-500/40';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-2xl ${bg} ${border} border shadow-2xl backdrop-blur-xl flex items-start gap-3 transform transition-all duration-300 animate-fade-in`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white leading-tight">{n.title}</h5>
              {n.message && <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
