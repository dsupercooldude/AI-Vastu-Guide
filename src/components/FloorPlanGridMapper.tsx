import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Compass, 
  Layers, 
  Download, 
  RotateCw, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Info, 
  Sliders, 
  Check, 
  Sparkles,
  MapPin,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { VASTU_16_ZONES, VASTU_32_PADAS, FIVE_ELEMENTS, ZoneInfo } from '../constants/vastuData';
import { 
  renderShaktiChakraToCanvas, 
  GridRenderOptions, 
  DEFAULT_GRID_OPTIONS,
  generateShaktiChakraImage 
} from '../utils/floorPlanGridRenderer';
import { VastuRemedy } from '../types';

interface FloorPlanGridMapperProps {
  imageSrc: string;
  initialRotation?: number;
  initialCenterX?: number;
  initialCenterY?: number;
  initialScale?: number;
  houseName?: string;
  defects?: VastuRemedy[];
  mainEntrancePada?: string;
  onSaveGrid?: (dataUrl: string, config: { rotation: number; centerX: number; centerY: number; radiusScale: number }) => void;
  className?: string;
}

export function FloorPlanGridMapper({
  imageSrc,
  initialRotation = 0,
  initialCenterX = 50,
  initialCenterY = 50,
  initialScale = 1.0,
  houseName = 'Property Floor Plan',
  defects = [],
  mainEntrancePada,
  onSaveGrid,
  className = ''
}: FloorPlanGridMapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rotation, setRotation] = useState(initialRotation);
  const [centerX, setCenterX] = useState(initialCenterX);
  const [centerY, setCenterY] = useState(initialCenterY);
  const [radiusScale, setRadiusScale] = useState(initialScale);
  const [zoneOpacity, setZoneOpacity] = useState(0.28);

  const [showZones, setShowZones] = useState(true);
  const [showPadas, setShowPadas] = useState(true);
  const [showDegreeRing, setShowDegreeRing] = useState(true);
  const [showBrahmasthan, setShowBrahmasthan] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showDefectMarkers, setShowDefectMarkers] = useState(true);

  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);
  const [isDraggingCenter, setIsDraggingCenter] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedState, setCopiedState] = useState(false);

  // Pre-load image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      redraw();
    };
    img.onerror = () => {
      // Fallback without crossOrigin in case CORS header is omitted
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        imageObjRef.current = fallbackImg;
        redraw();
      };
      fallbackImg.src = imageSrc;
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas whenever options change
  const redraw = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Set internal resolution based on container width
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(800, Math.round(rect.width * window.devicePixelRatio || 1200));
    const h = Math.max(600, Math.round(rect.height * window.devicePixelRatio || 900));
    
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const options: GridRenderOptions = {
      rotation,
      centerX,
      centerY,
      radiusScale,
      showZones,
      showZoneFills: true,
      showPadas,
      showDegreeRing,
      showBrahmasthan,
      showLabels,
      showDefectMarkers,
      zoneOpacity,
      houseName,
      defects: defects.map(d => ({ zone: d.zone, defect: d.defect, severity: d.severity })),
      mainEntrancePada
    };

    renderShaktiChakraToCanvas(canvas, imageObjRef.current, options);
  }, [
    rotation, 
    centerX, 
    centerY, 
    radiusScale, 
    zoneOpacity, 
    showZones, 
    showPadas, 
    showDegreeRing, 
    showBrahmasthan, 
    showLabels, 
    showDefectMarkers,
    houseName,
    defects,
    mainEntrancePada
  ]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Handle Dragging Center Brahmasthan
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked near Brahmasthan center (within 10%)
    const dist = Math.hypot(clickX - centerX, clickY - centerY);
    if (dist < 12) {
      setIsDraggingCenter(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCenter || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    setCenterX(Math.round(newX * 10) / 10);
    setCenterY(Math.round(newY * 10) / 10);
  };

  const handlePointerUp = () => {
    setIsDraggingCenter(false);
  };

  // Download High-Res Composite Image
  const handleDownloadImage = async () => {
    try {
      setIsExporting(true);
      const highResDataUrl = await generateShaktiChakraImage(imageSrc, {
        rotation,
        centerX,
        centerY,
        radiusScale,
        showZones,
        showZoneFills: true,
        showPadas,
        showDegreeRing,
        showBrahmasthan,
        showLabels,
        showDefectMarkers,
        zoneOpacity,
        houseName,
        defects: defects.map(d => ({ zone: d.zone, defect: d.defect, severity: d.severity })),
        mainEntrancePada
      });

      const a = document.createElement('a');
      a.href = highResDataUrl;
      a.download = `Vastu_16_Zones_Grid_${houseName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (onSaveGrid) {
        onSaveGrid(highResDataUrl, { rotation, centerX, centerY, radiusScale });
      }

      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 3000);
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`bg-stone-900 rounded-2xl border border-stone-800 text-stone-100 overflow-hidden shadow-xl ${className}`}>
      {/* Top Header Bar */}
      <div className="p-4 border-b border-stone-800 bg-stone-950/70 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Vastu Shakti Chakra 16-Zone Grid Map
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                32 Padas Included
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Interactive Vedic floor plan mapping overlay with 360° degree calibration & Brahmasthan core
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 text-stone-950 rounded-xl font-bold text-xs transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                Generating...
              </>
            ) : copiedState ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                Saved & Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Mapped Image (PNG)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: Canvas Area */}
        <div className="lg:col-span-8 p-4 bg-stone-950 flex flex-col items-center justify-center relative min-h-[460px] md:min-h-[580px]">
          <div 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full h-[440px] md:h-[540px] rounded-xl overflow-hidden border border-stone-800 bg-stone-900/90 flex items-center justify-center cursor-crosshair select-none touch-none"
          >
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain block"
            />

            {/* Helper overlay instruction if dragging center */}
            {isDraggingCenter && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Dragging Brahmasthan Center ({centerX.toFixed(0)}%, {centerY.toFixed(0)}%)
              </div>
            )}

            {/* Floating Quick Compass Badge */}
            <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-400 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              North: {rotation.toFixed(1)}°
            </div>
          </div>

          {/* Canvas Bottom Legend Strip */}
          <div className="w-full mt-3 flex items-center justify-between text-[11px] text-stone-400 px-2 flex-wrap gap-2">
            <span className="flex items-center gap-1 text-stone-300">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Tip: Click & drag the yellow Brahmasthan center marker to align with the core of the floor plan.
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Auspicious Padas
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Inauspicious Padas
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Zone Inspector */}
        <div className="lg:col-span-4 p-5 bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-800 flex flex-col justify-between gap-6 overflow-y-auto max-h-[660px]">
          
          <div className="space-y-5">
            {/* Calibration Controls */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" /> Degree & Orientation Calibration
                </h4>
                <button
                  onClick={() => {
                    setRotation(0);
                    setCenterX(50);
                    setCenterY(50);
                    setRadiusScale(1.0);
                  }}
                  className="text-[11px] text-stone-400 hover:text-white underline cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Rotation Slider */}
              <div className="space-y-2 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300 font-medium">True North Angle</span>
                  <span className="font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
                <div className="flex items-center justify-between gap-1 pt-1">
                  <button onClick={() => setRotation(0)} className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-[10px] rounded text-stone-300 font-mono">0° N</button>
                  <button onClick={() => setRotation(90)} className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-[10px] rounded text-stone-300 font-mono">90° E</button>
                  <button onClick={() => setRotation(180)} className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-[10px] rounded text-stone-300 font-mono">180° S</button>
                  <button onClick={() => setRotation(270)} className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-[10px] rounded text-stone-300 font-mono">270° W</button>
                  <button onClick={() => setRotation(prev => (prev + 5) % 360)} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] rounded font-mono">+5°</button>
                </div>
              </div>

              {/* Brahmasthan Center Sliders */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Center X</span>
                    <span className="text-white font-mono">{centerX}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={centerX}
                    onChange={(e) => setCenterX(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-stone-800 rounded cursor-pointer"
                  />
                </div>
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Center Y</span>
                    <span className="text-white font-mono">{centerY}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={centerY}
                    onChange={(e) => setCenterY(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-stone-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Grid Scale & Opacity */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Grid Radius</span>
                    <span className="text-white font-mono">{radiusScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.05"
                    value={radiusScale}
                    onChange={(e) => setRadiusScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-stone-800 rounded cursor-pointer"
                  />
                </div>
                <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Zone Tint</span>
                    <span className="text-white font-mono">{Math.round(zoneOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.65"
                    step="0.05"
                    value={zoneOpacity}
                    onChange={(e) => setZoneOpacity(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-stone-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Layer Visibility Toggles */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Shakti Chakra Layers
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setShowZones(prev => !prev)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${showZones ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}
                >
                  <span>16 Radial Zones</span>
                  {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowPadas(prev => !prev)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${showPadas ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}
                >
                  <span>32 Entrance Padas</span>
                  {showPadas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowDegreeRing(prev => !prev)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${showDegreeRing ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}
                >
                  <span>360° Degree Dial</span>
                  {showDegreeRing ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowBrahmasthan(prev => !prev)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${showBrahmasthan ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}
                >
                  <span>Brahmasthan Core</span>
                  {showBrahmasthan ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowLabels(prev => !prev)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${showLabels ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}
                >
                  <span>Zone Tags</span>
                  {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowDefectMarkers(prev => !prev)}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${showDefectMarkers ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-stone-950/40 border-stone-800 text-stone-500'}`}
                >
                  <span>Fault Pins (!)</span>
                  {showDefectMarkers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick 16-Zone Inspector */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Zone Energy Inspector
              </h4>
              <select
                onChange={(e) => {
                  const z = VASTU_16_ZONES.find(item => item.id === e.target.value);
                  setSelectedZone(z || null);
                }}
                value={selectedZone?.id || ''}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 outline-none focus:border-amber-500"
              >
                <option value="">Select a zone to inspect attributes & remedies...</option>
                {VASTU_16_ZONES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.shortName}) - {z.element} Element [{z.degrees[0]}° - {z.degrees[1]}°]
                  </option>
                ))}
              </select>

              {selectedZone && (
                <div className="mt-3 p-3.5 bg-stone-950/80 rounded-xl border border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedZone.elementColor }} />
                      {selectedZone.name} ({selectedZone.sanskrit})
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                      {selectedZone.degrees[0]}° - {selectedZone.degrees[1]}°
                    </span>
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    <strong className="text-amber-400">Energy & Life Aspect:</strong> {selectedZone.attribute}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800/60 text-[10px]">
                    <div>
                      <span className="text-stone-500 block">Deity / Power:</span>
                      <span className="text-stone-200 font-semibold">{selectedZone.deity}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Panchtattva Element:</span>
                      <span className="text-stone-200 font-semibold">{selectedZone.element}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Recommended Rooms:</span>
                      <span className="text-emerald-400">{selectedZone.idealRooms.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">No-Demolition Cure:</span>
                      <span className="text-amber-300 font-semibold">{selectedZone.stripMetal}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-4 border-t border-stone-800 space-y-2">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download High-Res Mapped Floor Plan (PNG)
            </button>
            <p className="text-[10px] text-stone-500 text-center">
              Composite matches the standard 16-Zone / 32-Pada Dubai architectural grid format
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
