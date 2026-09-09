import { Activity, RefreshCw } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ConfidenceMeter({ confidence, onRefresh, isRefreshing }: ConfidenceMeterProps) {
  // Determine color based on confidence level
  const colorClass = 
    confidence >= 85 ? 'bg-green-500' : 
    confidence >= 70 ? 'bg-amber-500' : 
    'bg-red-500';
    
  const textColor = 
    confidence >= 85 ? 'text-green-600' : 
    confidence >= 70 ? 'text-amber-600' : 
    'text-red-600';

  return (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-sm mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-stone-500" /> 
            AI Knowledge Confidence
          </h3>
          <p className="text-xs text-stone-500 mt-1">Based on baseline data & recent live internet sources</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg transition-colors border border-stone-200"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Fetching...' : 'Refresh Source'}
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className={`text-lg font-bold min-w-[3rem] text-right ${textColor}`}>
          {confidence}%
        </span>
      </div>
    </div>
  );
}
