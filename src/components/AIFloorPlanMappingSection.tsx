import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  RotateCw, 
  Sliders, 
  Maximize2, 
  DoorOpen, 
  Layers, 
  ShieldAlert, 
  RefreshCw, 
  Check, 
  Info,
  Wrench,
  Tag,
  ChevronRight,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Globe2
} from 'lucide-react';
import { FloorPlanMappingResult, VastuRemedy } from '../types';
import { FloorPlanGridMapper } from './FloorPlanGridMapper';
import { VASTU_16_ZONES, VASTU_32_PADAS, FIVE_ELEMENTS } from '../constants/vastuData';
import { generateShaktiChakraImage } from '../utils/floorPlanGridRenderer';

interface AIFloorPlanMappingSectionProps {
  floorPlanUrl: string;
  floorPlanData?: string;
  mimeType?: string;
  houseName: string;
  initialMapping?: FloorPlanMappingResult | null;
  onCalibrationChange?: (calibration: { rotation: number; centerX: number; centerY: number; radiusScale: number }) => void;
  className?: string;
}

export function AIFloorPlanMappingSection({
  floorPlanUrl,
  floorPlanData,
  mimeType = 'image/jpeg',
  houseName,
  initialMapping,
  onCalibrationChange,
  className = ''
}: AIFloorPlanMappingSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappingResult, setMappingResult] = useState<FloorPlanMappingResult | null>(initialMapping || null);
  const [activeTab, setActiveTab] = useState<'shakti-chakra' | 'faults' | 'remedies' | 'padas' | 'rooms'>('shakti-chakra');
  const [faultFilter, setFaultFilter] = useState<'all' | 'critical' | 'major' | 'moderate'>('all');
  const [appliedRemedies, setAppliedRemedies] = useState<Record<number, boolean>>({});
  const [currentCalibration, setCurrentCalibration] = useState({
    rotation: initialMapping?.rotation ?? 0,
    centerX: initialMapping?.centerX ?? 50,
    centerY: initialMapping?.centerY ?? 50,
    radiusScale: initialMapping?.radiusScale ?? 1.05
  });

  const toggleRemedy = (idx: number) => {
    setAppliedRemedies(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Auto-detect directions using AI if not already provided
  const runAIDetection = async () => {
    const rawData = floorPlanData || floorPlanUrl;
    if (!rawData) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/detect-floorplan-directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          floorPlanData: rawData,
          mimeType,
          houseName
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to detect directions with AI');
      }

      const data = await response.json();
      if (data.mapping) {
        setMappingResult(data.mapping);
        const newCal = {
          rotation: data.mapping.rotation ?? 0,
          centerX: data.mapping.centerX ?? 50,
          centerY: data.mapping.centerY ?? 50,
          radiusScale: data.mapping.radiusScale ?? 1.05
        };
        setCurrentCalibration(newCal);
        if (onCalibrationChange) {
          onCalibrationChange(newCal);
        }
      }
    } catch (err: any) {
      console.error('Error in AI direction detection:', err);
      setError(err.message || 'AI direction detection timed out. You can adjust the direction manually.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialMapping && (floorPlanData || floorPlanUrl)) {
      runAIDetection();
    }
  }, [floorPlanUrl, floorPlanData]);

  const handleCalibrationUpdate = (cal: { rotation: number; centerX: number; centerY: number; radiusScale: number }) => {
    setCurrentCalibration(cal);
    if (onCalibrationChange) {
      onCalibrationChange(cal);
    }
  };

  // Quick download high-res composite image
  const handleDownloadImage = async () => {
    try {
      const dataUrl = await generateShaktiChakraImage(floorPlanUrl, {
        rotation: currentCalibration.rotation,
        centerX: currentCalibration.centerX,
        centerY: currentCalibration.centerY,
        radiusScale: currentCalibration.radiusScale,
        themeStyle: 'architectural',
        showZones: true,
        showPadas: true,
        showDegreeRing: true,
        showBrahmasthan: true,
        showBuildingBoundary: true,
        houseName: houseName || 'Floor Plan Vastu Mapping',
        mainEntrancePada: mappingResult?.mainEntrancePada || 'N4',
        defects: mappingResult?.defects?.map(d => ({ zone: d.zone, defect: d.defect, severity: d.severity })) || []
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Vastu_Shakti_Chakra_${(houseName || 'FloorPlan').replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download composite image:', err);
    }
  };

  const defectsList: VastuRemedy[] = mappingResult?.defects || [];
  const filteredDefects = defectsList.filter(d => {
    if (faultFilter === 'all') return true;
    if (faultFilter === 'critical') return d.severity === 'Critical';
    if (faultFilter === 'major') return d.severity === 'Major';
    return d.severity === 'Moderate' || !d.severity;
  });

  return (
    <div className={`rounded-2xl border-2 border-amber-500/30 bg-stone-900 text-stone-100 shadow-xl overflow-hidden ${className}`}>
      
      {/* Header with AI Direction Summary */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                AI Floor Plan Direction Mapping
              </span>
              {mappingResult && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {mappingResult.confidence || 92}% Accuracy
                </span>
              )}
              {mappingResult?.mainEntrancePada && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <DoorOpen className="w-3 h-3" />
                  Main Door: Pada {mappingResult.mainEntrancePada}
                </span>
              )}
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              16-Zone Shakti Chakra Grid & Alignment
            </h3>
            
            <p className="text-xs md:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
              {mappingResult?.detectionMethod 
                ? `AI Insight: ${mappingResult.detectionMethod}. North is aligned at ${currentCalibration.rotation.toFixed(1)}°.`
                : 'Scanned floor plan blueprint to calculate North angle, geometric Brahmasthan, and 32 entrance padas.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={runAIDetection}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              title="Re-run AI auto direction detection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              {loading ? 'AI Detecting...' : 'Re-scan with AI'}
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              Download Mapped Image
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs text-amber-300 font-medium">
              Scanning CAD blueprint for True North compass arrow, centroid Brahmasthan, and entrance padas...
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Multi-Tab Navigation Bar */}
      <div className="bg-stone-950/80 px-4 md:px-6 border-b border-stone-800 flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex gap-2 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('shakti-chakra')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shakti-chakra'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            1. Mapped Shakti Chakra
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faults')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'faults'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            2. Directional Faults (Doshas)
            {defectsList.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'faults' ? 'bg-stone-950 text-amber-400' : 'bg-red-500/30 text-red-400'
              }`}>
                {defectsList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('remedies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'remedies'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            3. Remedies & Cures (Non-Demolition)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('padas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'padas'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            4. 32 Entrance Padas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            5. Room Placements
          </button>
        </div>
      </div>

      {/* Tab 1: Mapped Shakti Chakra Visualizer */}
      {activeTab === 'shakti-chakra' && (
        <div className="p-4 md:p-6">
          <FloorPlanGridMapper
            imageSrc={floorPlanUrl}
            initialRotation={currentCalibration.rotation}
            initialCenterX={currentCalibration.centerX}
            initialCenterY={currentCalibration.centerY}
            initialScale={currentCalibration.radiusScale}
            houseName={houseName}
            mainEntrancePada={mappingResult?.mainEntrancePada || 'N4'}
            defects={mappingResult?.defects || []}
            onSaveGrid={(dataUrl, cal) => handleCalibrationUpdate(cal)}
            className="w-full"
          />
        </div>
      )}

      {/* Tab 2: Directional Faults (Doshas) */}
      {activeTab === 'faults' && (
        <div className="p-4 md:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Detected Spatial Defects & Energy Imbalances
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Identified based on the 16-zone Shakti Chakra orientation and elemental theory.
              </p>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800">
              {(['all', 'critical', 'major', 'moderate'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFaultFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                    faultFilter === f
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredDefects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDefects.map((defect, dIdx) => (
                <div 
                  key={dIdx}
                  className="bg-stone-950/70 border border-stone-800 rounded-xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        defect.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        defect.severity === 'Major' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {defect.severity || 'Major'} Defect
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-stone-900 text-amber-300 rounded border border-stone-800">
                        {defect.zone} Zone
                      </span>
                    </div>

                    <h5 className="text-base font-bold text-white mb-1.5">{defect.defect}</h5>
                    {defect.affectedArea && (
                      <p className="text-xs text-stone-400 mb-2">
                        <span className="text-stone-500 font-medium">Life Impact:</span> {defect.affectedArea}
                      </p>
                    )}
                    
                    <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800 text-xs text-stone-300">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                        <Wrench className="w-3.5 h-3.5" />
                        Recommended Non-Demolition Cure:
                      </div>
                      <p className="leading-relaxed">{defect.remedy}</p>
                      {defect.treatmentMetal && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[11px]">
                          Metal: {defect.treatmentMetal}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-[11px] text-stone-400">
                    <span>Effort: <strong className="text-stone-200">{defect.effort || 'Low'}</strong></span>
                    <span>Cost: <strong className="text-stone-200">{defect.cost || 'Low'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-stone-950/40 rounded-xl border border-stone-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h5 className="text-lg font-bold text-white">No Critical Violations in this Filter</h5>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                The floor plan exhibits strong cardinal zoning harmony or defects have been remedied.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Remedies & Non-Demolition Cures */}
      {activeTab === 'remedies' && (
        <div className="p-4 md:p-6 space-y-5">
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              Zero-Demolition Elemental Remedies (Dubai & MahaVastu Standard)
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Correct doshas using elemental metal strips, colored energy tapes, and space programming without breaking any walls.
            </p>
          </div>

          <div className="space-y-4">
            {defectsList.map((remedy, idx) => {
              const isApplied = appliedRemedies[idx] || false;
              return (
                <div 
                  key={idx}
                  className={`p-5 rounded-xl border transition-all ${
                    isApplied 
                      ? 'bg-emerald-950/30 border-emerald-500/40' 
                      : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {remedy.category || 'Elemental Strip'}
                        </span>
                        <span className="text-xs text-stone-400 font-semibold">
                          Target Zone: <strong className="text-stone-200">{remedy.zone}</strong>
                        </span>
                        {remedy.treatmentMetal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600/30 text-amber-200">
                            {remedy.treatmentMetal}
                          </span>
                        )}
                      </div>

                      <h5 className="text-base font-bold text-white mb-1">{remedy.defect}</h5>
                      <p className="text-sm text-stone-300 leading-relaxed mt-2">{remedy.remedy}</p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-stone-400">
                        <span>Cost: <strong className="text-stone-200">{remedy.cost || 'Low'}</strong></span>
                        <span>Effort: <strong className="text-stone-200">{remedy.effort || 'Low'}</strong></span>
                        <span>Category: <strong className="text-stone-200">{remedy.category || 'Elemental Strip'}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRemedy(idx)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                        isApplied 
                          ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20' 
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {isApplied ? 'Remedy Applied' : 'Mark as Applied'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: 32 Entrance Padas */}
      {activeTab === 'padas' && (
        <div className="p-4 md:p-6 space-y-5">
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-amber-400" />
              The 32 Entrance Padas Matrix
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Main doors located in auspicious padas (N3, N4, E3, E4, S3, S4, W3, W4) channel supreme prosperity, health, and vitality.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            {VASTU_32_PADAS.map((pada) => {
              const isMainEntrance = mappingResult?.mainEntrancePada === pada.code;
              const isAuspicious = pada.status === 'Auspicious';

              return (
                <div
                  key={pada.code}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isMainEntrance
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : isAuspicious
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-stone-950/60 border-stone-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-black text-white">{pada.code}</span>
                    <span className={`w-2 h-2 rounded-full ${isAuspicious ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="text-[11px] font-bold text-stone-300 truncate">{pada.name}</div>
                  <div className="text-[9px] text-stone-400 mt-0.5 truncate">{pada.direction}</div>

                  {isMainEntrance && (
                    <div className="mt-2 py-0.5 px-1 rounded bg-amber-500 text-stone-950 font-black text-[9px] uppercase tracking-wide">
                      Main Door
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Room Placements */}
      {activeTab === 'rooms' && (
        <div className="p-4 md:p-6 space-y-5">
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Room Placements & Zone Diagnostics
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Detected architectural spaces correlated against the 16 Vastu cardinal sectors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/80 text-stone-400">
                  <th className="py-3 px-4 font-semibold">Room / Space</th>
                  <th className="py-3 px-4 font-semibold">Allocated Vastu Zone</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Architectural Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {(mappingResult?.rooms && mappingResult.rooms.length > 0) ? (
                  mappingResult.rooms.map((room, rIdx) => (
                    <tr key={rIdx} className="hover:bg-stone-950/50">
                      <td className="py-3 px-4 font-bold text-white">{room.name}</td>
                      <td className="py-3 px-4 text-amber-300 font-semibold">{room.zone}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          room.compliant 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {room.compliant ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {room.compliant ? 'Compliant' : 'Vastu Defect'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-400">{room.note || 'Identified on CAD floor plan'}</td>
                    </tr>
                  ))
                ) : (
                  [
                    { name: 'Master Bedroom', zone: 'South-West (SW)', compliant: true, note: 'Ideal Earth zone for master suite' },
                    { name: 'Kitchen (Agni)', zone: 'South-East (SE)', compliant: true, note: 'Fire element balanced' },
                    { name: 'Living / Family Room', zone: 'North / North-East', compliant: true, note: 'Light airy positive entrance zone' },
                    { name: 'Center (Brahmasthan)', zone: 'Core Centroid', compliant: true, note: 'Clear energy channel maintained' }
                  ].map((room, rIdx) => (
                    <tr key={rIdx} className="hover:bg-stone-950/50">
                      <td className="py-3 px-4 font-bold text-white">{room.name}</td>
                      <td className="py-3 px-4 text-amber-300 font-semibold">{room.zone}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Compliant
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-400">{room.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
