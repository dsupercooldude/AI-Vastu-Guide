import { useState, useEffect } from 'react';
import { Server, Activity, CheckCircle2, Clock } from 'lucide-react';

interface Engine {
  name: string;
  used: number;
  limit: number;
  status: string;
}

export function AIEngineUsage() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota');
      const data = await res.json();
      if (data && data.engines) {
        setEngines(data.engines);
      }
    } catch (e) {
      // Silently fail on network errors during server restarts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(fetchQuota, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && engines.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-8">
      <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
        <Server className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-stone-800">AI Engine Orchestration</h3>
        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
          <Activity className="w-3 h-3" /> Live Diagnostics
        </span>
      </div>
      
      <div className="p-4 space-y-4">
        {engines.map((engine, idx) => {
          const usagePercent = Math.min(100, Math.round((engine.used / engine.limit) * 100));
          const isWarning = usagePercent > 80;
          
          let statusColor = "bg-stone-100 text-stone-600";
          let StatusIcon = Clock;
          if (engine.status.includes('Active')) {
            statusColor = "bg-emerald-100 text-emerald-700";
            StatusIcon = CheckCircle2;
          }

          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  {engine.name}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                    <StatusIcon className="w-3 h-3" /> {engine.status}
                  </span>
                </span>
                <span className="text-xs font-medium text-stone-500">
                  {engine.used} / {engine.limit} reqs
                </span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isWarning ? 'bg-red-500' : 'bg-indigo-500'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="pt-2 text-xs text-stone-400 flex items-center justify-center gap-1 border-t border-stone-100">
          * Utilizing sequential bypass routing to prevent quota exhaustion.
        </div>
      </div>
    </div>
  );
}
