const fs = require('fs');

const code = `
import React, { useState, useRef, useEffect } from 'react';
import { X, Grid3X3, Settings2 } from 'lucide-react';

interface ImageOverlayModalProps {
  src: string;
  onClose: () => void;
  actions?: React.ReactNode;
}

const ZONES_16 = [
  { name: 'N', color: 'rgba(59, 130, 246, 0.4)' },
  { name: 'NNE', color: 'rgba(59, 130, 246, 0.3)' },
  { name: 'NE', color: 'rgba(20, 184, 166, 0.4)' },
  { name: 'ENE', color: 'rgba(20, 184, 166, 0.3)' },
  { name: 'E', color: 'rgba(34, 197, 94, 0.4)' },
  { name: 'ESE', color: 'rgba(34, 197, 94, 0.3)' },
  { name: 'SE', color: 'rgba(239, 68, 68, 0.4)' },
  { name: 'SSE', color: 'rgba(239, 68, 68, 0.3)' },
  { name: 'S', color: 'rgba(249, 115, 22, 0.4)' },
  { name: 'SSW', color: 'rgba(249, 115, 22, 0.3)' },
  { name: 'SW', color: 'rgba(202, 138, 4, 0.4)' },
  { name: 'WSW', color: 'rgba(202, 138, 4, 0.3)' },
  { name: 'W', color: 'rgba(99, 102, 241, 0.4)' },
  { name: 'WNW', color: 'rgba(99, 102, 241, 0.3)' },
  { name: 'NW', color: 'rgba(168, 85, 247, 0.4)' },
  { name: 'NNW', color: 'rgba(168, 85, 247, 0.3)' },
];

export function ImageOverlayModal({ src, onClose, actions }: ImageOverlayModalProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [centerPos, setCenterPos] = useState({ x: 50, y: 50 }); // percentages
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!showGrid) return;
    setIsDragging(true);
    updateCenter(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !showGrid) return;
    updateCenter(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateCenter = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCenterPos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-sans">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="max-w-4xl w-full flex flex-col items-center gap-6">
        <div 
          className="relative inline-block overflow-hidden rounded-lg select-none cursor-crosshair touch-none"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img 
            ref={imgRef}
            src={src} 
            alt="Preview" 
            className="max-h-[70vh] object-contain block pointer-events-none"
          />
          
          {showGrid && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
              style={{ overflow: 'visible' }}
            >
              {ZONES_16.map((zone, i) => {
                const angle = rotation + (i * 22.5) - 11.25;
                const rad1 = (angle * Math.PI) / 180;
                const rad2 = ((angle + 22.5) * Math.PI) / 180;
                const cx = \`\${centerPos.x}%\`;
                const cy = \`\${centerPos.y}%\`;
                
                // We draw massive lines that overflow the image bounds to ensure coverage
                const r = 2000;
                const p1x = centerPos.x + (Math.sin(rad1) * r);
                const p1y = centerPos.y - (Math.cos(rad1) * r);
                const p2x = centerPos.x + (Math.sin(rad2) * r);
                const p2y = centerPos.y - (Math.cos(rad2) * r);

                // Midpoint for text label
                const midAngle = angle + 11.25;
                const midRad = (midAngle * Math.PI) / 180;
                // Position text at a reasonable radius, relative to the container size
                // We'll use a fixed pixel offset so it doesn't get clipped
                const tx = centerPos.x + (Math.sin(midRad) * 35);
                const ty = centerPos.y - (Math.cos(midRad) * 35);

                return (
                  <g key={zone.name}>
                    <polygon 
                      points={\`\${cx},\${cy} \${p1x}%,\${p1y}% \${p2x}%,\${p2y}%\`} 
                      fill={zone.color}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={\`\${tx}%\`}
                      y={\`\${ty}%\`}
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {zone.name}
                    </text>
                  </g>
                );
              })}
              
              {/* Brahmasthan Center Marker */}
              <circle cx={\`\${centerPos.x}%\`} cy={\`\${centerPos.y}%\`} r="6" fill="#fbbf24" stroke="white" strokeWidth="2" />
              <circle cx={\`\${centerPos.x}%\`} cy={\`\${centerPos.y}%\`} r="24" fill="transparent" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          )}
        </div>
        
        {showGrid && (
          <div className="w-full max-w-sm bg-stone-900/80 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <Settings2 className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-sm">Mandala Calibration</h4>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              1. Drag the center dot to align with the physical center of the floor plan (Brahmasthan).<br/>
              2. Use the slider below to align North to your actual property orientation.
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-medium text-stone-300 w-12 text-right">{rotation}°</span>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotation} 
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-white/20 rounded-full appearance-none outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all \${showGrid ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white'}\`}
          >
            <Grid3X3 className="w-5 h-5" /> {showGrid ? '16-Zone Mandala Active' : 'Overlay 16-Zone Mandala'}
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/ImageOverlayModal.tsx', code);
