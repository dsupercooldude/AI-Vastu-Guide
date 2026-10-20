import React, { useState } from 'react';
import { X, Grid3X3, Compass, Download } from 'lucide-react';
import { FloorPlanGridMapper } from './FloorPlanGridMapper';

interface ImageOverlayModalProps {
  src: string;
  onClose: () => void;
  actions?: React.ReactNode;
  houseName?: string;
}

export function ImageOverlayModal({ src, onClose, actions, houseName = 'Property Floor Plan' }: ImageOverlayModalProps) {
  const [mode, setMode] = useState<'shakti-chakra' | 'simple'>('shakti-chakra');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-sans overflow-y-auto">
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-50 cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="max-w-5xl w-full my-auto flex flex-col items-center gap-4 py-8">
        
        {/* Toggle between Full Shakti Chakra Grid Mapper and Clean Image View */}
        <div className="flex items-center gap-2 bg-stone-900/80 p-1.5 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setMode('shakti-chakra')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'shakti-chakra' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> Vastu 16-Zone Shakti Chakra Grid
          </button>
          <button
            onClick={() => setMode('simple')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'simple' ? 'bg-stone-700 text-white shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-4 h-4" /> Clean Original Photo
          </button>
        </div>

        {mode === 'shakti-chakra' ? (
          <div className="w-full">
            <FloorPlanGridMapper
              imageSrc={src}
              houseName={houseName}
            />
          </div>
        ) : (
          <div className="relative inline-block overflow-hidden rounded-xl border border-stone-800 bg-stone-950 max-h-[75vh]">
            <img 
              src={src} 
              alt="Floor plan original" 
              className="max-h-[70vh] object-contain block mx-auto"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-700/60 hover:bg-stone-700 text-stone-200 rounded-xl font-medium text-xs transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

      </div>
    </div>
  );
}
