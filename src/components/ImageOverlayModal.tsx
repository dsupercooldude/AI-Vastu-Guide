import { useState } from 'react';
import { X, Grid3X3 } from 'lucide-react';

interface ImageOverlayModalProps {
  src: string;
  onClose: () => void;
  actions?: React.ReactNode;
}

export function ImageOverlayModal({ src, onClose, actions }: ImageOverlayModalProps) {
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="max-w-4xl w-full flex flex-col items-center gap-6">
        <div className="relative inline-block overflow-hidden rounded-lg">
          <img 
            src={src} 
            alt="Preview" 
            className="max-h-[75vh] object-contain block"
          />
          
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {/* Northwest */}
              <div className="border border-white/40 bg-blue-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">NW (Air)</span>
              </div>
              {/* North */}
              <div className="border border-white/40 bg-emerald-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">N (Wealth)</span>
              </div>
              {/* Northeast */}
              <div className="border border-white/40 bg-cyan-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">NE (Water)</span>
              </div>
              
              {/* West */}
              <div className="border border-white/40 bg-indigo-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">W (Gains)</span>
              </div>
              {/* Center */}
              <div className="border border-white/40 bg-transparent flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">Brahmasthan (Space)</span>
              </div>
              {/* East */}
              <div className="border border-white/40 bg-orange-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">E (Health)</span>
              </div>
              
              {/* Southwest */}
              <div className="border border-white/40 bg-stone-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">SW (Earth)</span>
              </div>
              {/* South */}
              <div className="border border-white/40 bg-red-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">S (Fame)</span>
              </div>
              {/* Southeast */}
              <div className="border border-white/40 bg-rose-500/20 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">SE (Fire)</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${showGrid ? 'bg-amber-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            <Grid3X3 className="w-5 h-5" /> {showGrid ? 'Hide Vastu Grid' : 'Show Vastu Grid'}
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}
