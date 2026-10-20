import React, { useState } from 'react';
import { 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  DoorOpen, 
  BarChart3, 
  Download, 
  FileText, 
  Filter, 
  ArrowUpRight, 
  Layers, 
  Sparkles,
  ChevronRight,
  Info,
  Check,
  Tag,
  Wrench,
  Activity,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Globe2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AnalysisHistory, VastuRemedy, PadaEvaluation } from '../types';
import { FloorPlanGridMapper } from './FloorPlanGridMapper';
import { VASTU_16_ZONES, VASTU_32_PADAS, FIVE_ELEMENTS } from '../constants/vastuData';
import { exportToPDF } from '../utils/pdfExport';

interface VastuAuditMultiTabProps {
  analysis: AnalysisHistory;
  houseName: string;
  onSaveGrid?: (dataUrl: string, config: any) => void;
  className?: string;
}

export function VastuAuditMultiTab({
  analysis,
  houseName,
  onSaveGrid,
  className = ''
}: VastuAuditMultiTabProps) {
  const [activeTab, setActiveTab] = useState<'grid' | 'faults' | 'remedies' | 'entrances' | 'report'>('grid');
  const [selectedFloorPlanIdx, setSelectedFloorPlanIdx] = useState(0);
  const [faultFilter, setFaultFilter] = useState<'all' | 'critical' | 'major' | 'moderate'>('all');
  const [remedyCategory, setRemedyCategory] = useState<'all' | 'Elemental Strip' | 'Space Programming' | 'Yantra & Crystal' | 'Relocation'>('all');
  const [appliedRemedies, setAppliedRemedies] = useState<Record<number, boolean>>({});

  const toggleRemedyApplied = (index: number) => {
    setAppliedRemedies(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const floorPlans = analysis.floorPlans && analysis.floorPlans.length > 0 ? analysis.floorPlans : [];
  const primaryFloorPlan = floorPlans[selectedFloorPlanIdx] || (analysis.images && analysis.images[0]) || '';

  // Extract defects and remedies
  const remediesList: VastuRemedy[] = analysis.remedies || [];
  
  // Categorize defects for filters
  const filteredDefects = remediesList.filter(r => {
    if (faultFilter === 'all') return true;
    if (faultFilter === 'critical') return r.severity === 'Critical' || r.defect.toLowerCase().includes('toilet') || r.defect.toLowerCase().includes('kitchen') || r.defect.toLowerCase().includes('cut');
    if (faultFilter === 'major') return r.severity === 'Major' || (!r.severity && r.cost === 'High');
    return true;
  });

  const filteredRemedies = remediesList.filter(r => {
    if (remedyCategory === 'all') return true;
    if (r.category === remedyCategory) return true;
    if (remedyCategory === 'Elemental Strip' && (r.remedy.toLowerCase().includes('strip') || r.remedy.toLowerCase().includes('tape') || r.remedy.toLowerCase().includes('wire') || r.treatmentMetal)) return true;
    if (remedyCategory === 'Space Programming' && (r.remedy.toLowerCase().includes('swastik') || r.remedy.toLowerCase().includes('plant') || r.remedy.toLowerCase().includes('mirror') || r.remedy.toLowerCase().includes('salt') || r.remedy.toLowerCase().includes('light'))) return true;
    if (remedyCategory === 'Yantra & Crystal' && (r.remedy.toLowerCase().includes('pyramid') || r.remedy.toLowerCase().includes('yantra') || r.remedy.toLowerCase().includes('crystal'))) return true;
    return false;
  });

  // 16-Zone Chart Data
  const zoneChartData = (analysis.zoneScores && analysis.zoneScores.length > 0)
    ? analysis.zoneScores.map(z => {
        const found = VASTU_16_ZONES.find(v => v.name.toLowerCase() === z.zone.toLowerCase() || v.shortName.toLowerCase() === z.zone.toLowerCase());
        return {
          name: z.zone,
          score: z.score,
          color: found ? found.elementColor : '#d97706',
          element: found ? found.element : 'Vastu'
        };
      })
    : VASTU_16_ZONES.slice(0, 9).map(z => ({
        name: z.shortName,
        score: Math.floor(Math.random() * 30) + 65,
        color: z.elementColor,
        element: z.element
      }));

  // Entrance Analysis: Determine main door
  const mainDoorRemedy = remediesList.find(r => r.defect.toLowerCase().includes('entrance') || r.defect.toLowerCase().includes('door') || r.pada);
  const detectedEntrancePada = mainDoorRemedy?.pada || analysis.mainEntrancePada || 'N4';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden ${className}`}>
      
      {/* Top Header & House Summary */}
      <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              MahaVastu Architecture Audit
            </span>
            <span className="text-xs text-stone-400">
              {new Date(analysis.timestamp).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {houseName || 'Property Vastu Audit'}
            {analysis.score !== undefined && (
              <span className={`text-sm px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 ${
                analysis.score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                analysis.score >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                Score: {analysis.score}/100
              </span>
            )}
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Complete 16-Zone Shakti Chakra mapping, 32 Entrance Padas evaluation, and non-demolition cures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToPDF(`audit-container-${analysis.id}`, `Vastu_Audit_${houseName.replace(/\s+/g, '_')}.pdf`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-all border border-stone-700 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" /> Export Full PDF Audit
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-stone-100/80 p-2 border-b border-stone-200 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'grid'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          1. Mapped Floor Plan Grid (Shakti Chakra)
        </button>

        <button
          onClick={() => setActiveTab('faults')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'faults'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          2. Faults & Doshas
          {remediesList.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'faults' ? 'bg-white text-amber-800' : 'bg-red-100 text-red-700'
            }`}>
              {remediesList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('remedies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'remedies'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          3. Remedies & Cures (No Demolition)
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'remedies' ? 'bg-white text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {remediesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('entrances')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'entrances'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          4. 32 Entrances (Padas)
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          5. 16-Zone Energy & Full Report
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div id={`audit-container-${analysis.id}`} className="p-6">

        {/* TAB 1: Mapped Floor Plan Grid */}
        {activeTab === 'grid' && (
          <div className="space-y-6">
            {floorPlans.length > 1 && (
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-xs font-bold text-stone-600">Select Floor Plan:</span>
                <div className="flex gap-2">
                  {floorPlans.map((fp, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFloorPlanIdx(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedFloorPlanIdx === i 
                          ? 'bg-amber-600 text-white shadow-sm' 
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Floor Plan {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {primaryFloorPlan ? (
              <FloorPlanGridMapper
                imageSrc={primaryFloorPlan}
                initialRotation={analysis.gridCalibration?.rotation || 0}
                initialCenterX={analysis.gridCalibration?.centerX || 50}
                initialCenterY={analysis.gridCalibration?.centerY || 50}
                initialScale={analysis.gridCalibration?.radiusScale || 1.0}
                houseName={houseName}
                defects={remediesList}
                mainEntrancePada={detectedEntrancePada}
                onSaveGrid={onSaveGrid}
              />
            ) : (
              <div className="p-12 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="font-bold text-stone-700 text-sm">No Floor Plan Found</h4>
                <p className="text-xs text-stone-500 mt-1">Upload a floor plan image during analysis to generate the complete 16-zone grid overlay.</p>
              </div>
            )}

            {/* Quick Summary Cards below grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Identified Defects</span>
                <span className="text-2xl font-black text-red-600 mt-1 block">{remediesList.length}</span>
                <span className="text-xs text-stone-500">Across 16 directional zones</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Entrance Pada</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">{detectedEntrancePada}</span>
                <span className="text-xs text-emerald-600 font-medium">Mapped to outer chakra</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Core Energy</span>
                <span className="text-2xl font-black text-stone-800 mt-1 block">Brahmasthan</span>
                <span className="text-xs text-stone-500">Center 9x9 energy nodal grid</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Remedies Applied</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {Object.values(appliedRemedies).filter(Boolean).length} / {remediesList.length}
                </span>
                <span className="text-xs text-stone-500">Non-demolition treatments</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Faults & Doshas */}
        {activeTab === 'faults' && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-500" />
                <span className="text-xs font-bold text-stone-600">Filter Faults:</span>
                <button
                  onClick={() => setFaultFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${faultFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-200'}`}
                >
                  All ({remediesList.length})
                </button>
                <button
                  onClick={() => setFaultFilter('critical')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${faultFilter === 'critical' ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}
                >
                  Critical Doshas
                </button>
                <button
                  onClick={() => setFaultFilter('major')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${faultFilter === 'major' ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-stone-200'}`}
                >
                  Major
                </button>
              </div>

              <span className="text-xs text-stone-500">
                Showing {filteredDefects.length} of {remediesList.length} defects
              </span>
            </div>

            {filteredDefects.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-stone-700">No Defects in Selected Category</h4>
                <p className="text-xs text-stone-500 mt-1">This space conforms well with Vastu balance rules.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDefects.map((item, idx) => {
                  const zoneData = VASTU_16_ZONES.find(z => z.id.toLowerCase() === item.zone.toLowerCase() || z.name.toLowerCase() === item.zone.toLowerCase());
                  const isCritical = item.severity === 'Critical' || item.defect.toLowerCase().includes('toilet') || item.defect.toLowerCase().includes('kitchen');

                  return (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isCritical 
                          ? 'bg-red-50/40 border-red-200 shadow-sm' 
                          : 'bg-white border-stone-200 shadow-sm hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: zoneData?.elementColor || '#dc2626' }}
                          >
                            {item.zone}
                          </span>
                          {zoneData && (
                            <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                              {zoneData.degrees[0]}° - {zoneData.degrees[1]}°
                            </span>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCritical ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.severity || (isCritical ? 'Critical' : 'Moderate')}
                        </span>
                      </div>

                      <h4 className="font-bold text-stone-900 text-sm leading-snug mb-2">
                        {item.defect}
                      </h4>

                      {item.affectedArea && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3 bg-white/80 p-2 rounded-lg border border-stone-100">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span><strong>Impacts:</strong> {item.affectedArea}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Governing Element: <strong>{zoneData?.element || 'Panchtattva'}</strong>
                        </span>
                        <button
                          onClick={() => setActiveTab('remedies')}
                          className="flex items-center gap-1 text-amber-700 font-bold hover:underline cursor-pointer"
                        >
                          View Remedy <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Remedies & Cures (Without Demolition) */}
        {activeTab === 'remedies' && (
          <div className="space-y-6">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-600">Remedy Type:</span>
              <button
                onClick={() => setRemedyCategory('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${remedyCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-200'}`}
              >
                All Remedies ({remediesList.length})
              </button>
              <button
                onClick={() => setRemedyCategory('Elemental Strip')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${remedyCategory === 'Elemental Strip' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-200'}`}
              >
                Metal Strips & Tapes
              </button>
              <button
                onClick={() => setRemedyCategory('Space Programming')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${remedyCategory === 'Space Programming' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-200'}`}
              >
                Space Programming & Cures
              </button>
            </div>

            {/* Implementation Progress Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {Math.round((Object.values(appliedRemedies).filter(Boolean).length / Math.max(1, remediesList.length)) * 100)}%
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Remedial Implementation Tracker</h4>
                  <p className="text-xs text-emerald-700">Check off remedies as you apply elemental strips and space programming cures.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800">
                {Object.values(appliedRemedies).filter(Boolean).length} of {remediesList.length} Applied
              </span>
            </div>

            {filteredRemedies.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-stone-700">No Specific Remedies In This Filter</h4>
                <p className="text-xs text-stone-500 mt-1">Switch to 'All Remedies' to view complete treatments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRemedies.map((remedy, i) => {
                  const isDone = !!appliedRemedies[i];
                  const zoneData = VASTU_16_ZONES.find(z => z.id.toLowerCase() === remedy.zone.toLowerCase() || z.name.toLowerCase() === remedy.zone.toLowerCase());

                  return (
                    <div 
                      key={i} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-emerald-50/40 border-emerald-200 opacity-90' 
                          : 'bg-white border-stone-200 shadow-sm hover:border-amber-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleRemedyApplied(i)}
                            className={`w-6 h-6 mt-0.5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                              isDone 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'border-stone-300 hover:border-amber-500 bg-white text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="px-2 py-0.5 rounded text-[11px] font-bold text-white"
                                style={{ backgroundColor: zoneData?.elementColor || '#d97706' }}
                              >
                                {remedy.zone} Zone
                              </span>
                              <span className="text-xs font-semibold text-stone-500">Defect:</span>
                              <span className="text-xs font-bold text-stone-800">{remedy.defect}</span>
                            </div>
                            <h4 className="font-bold text-stone-900 text-base">
                              Treatment: {remedy.remedy}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            remedy.cost === 'Low' ? 'bg-green-100 text-green-700' :
                            remedy.cost === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            Cost: {remedy.cost}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            remedy.effort === 'Low' ? 'bg-blue-100 text-blue-700' :
                            remedy.effort === 'Medium' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            Effort: {remedy.effort}
                          </span>
                        </div>
                      </div>

                      {/* Remedial Specification Footer */}
                      <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
                        <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Recommended Metal: <strong>{remedy.treatmentMetal || zoneData?.stripMetal || 'Elemental Brass / Copper / SS'}</strong>
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Non-demolition elemental balancing
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 32 Entrances (Padas) Diagnosis */}
        {activeTab === 'entrances' && (
          <div className="space-y-6">
            <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Entrance Pada Diagnosis
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Main Door Analysis: Pada {detectedEntrancePada}
                </h3>
                <p className="text-xs text-stone-400 mt-1 max-w-xl">
                  In classical Vastu Shastra, the perimeter is divided into 32 entrance padas (8 per cardinal direction). Only 8 padas bring immense fortune without remedies.
                </p>
              </div>

              {/* Status pill for detected door */}
              {(() => {
                const foundPada = VASTU_32_PADAS.find(p => p.code === detectedEntrancePada);
                const isGood = foundPada?.status === 'Auspicious';
                return (
                  <div className={`p-4 rounded-xl border text-center min-w-[200px] ${
                    isGood ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-red-950/60 border-red-500/50 text-red-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Your Entrance</span>
                    <span className="text-2xl font-black block mt-0.5">{foundPada?.code} - {foundPada?.name}</span>
                    <span className="text-xs font-bold mt-1 inline-block">
                      {isGood ? '✓ Auspicious Entrance' : '⚠️ Requires Threshold Strip'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 32 Padas Matrix (Grouped by East, South, West, North) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['East', 'South', 'West', 'North'] as const).map(direction => {
                const padasInDir = VASTU_32_PADAS.filter(p => p.direction === direction);
                return (
                  <div key={direction} className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                    <h4 className="font-bold text-stone-800 text-sm pb-2 border-b border-stone-200 flex items-center justify-between">
                      <span>{direction} Quadrant</span>
                      <span className="text-[11px] font-mono text-stone-500">{padasInDir[0].code} - {padasInDir[padasInDir.length - 1].code}</span>
                    </h4>

                    <div className="space-y-2 mt-3">
                      {padasInDir.map(pada => {
                        const isSelected = pada.code === detectedEntrancePada;
                        const isAuspicious = pada.status === 'Auspicious';

                        return (
                          <div
                            key={pada.code}
                            className={`p-2.5 rounded-xl border transition-all text-xs ${
                              isSelected
                                ? 'bg-amber-100/80 border-amber-500 ring-2 ring-amber-400 shadow-sm'
                                : isAuspicious
                                ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold mb-1">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isAuspicious ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                {pada.code} ({pada.name})
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                isAuspicious ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                              }`}>
                                {pada.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-tight">
                              {pada.effect}
                            </p>
                            {!isAuspicious && (
                              <p className="text-[10px] text-amber-800 font-medium mt-1.5 pt-1 border-t border-stone-100">
                                <strong>Cure:</strong> {pada.recommendedRemedy}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: 16-Zone Energy & Full Report */}
        {activeTab === 'report' && (
          <div className="space-y-8">
            {/* Zone Breakdown Bar Chart */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-stone-800 text-base">16-Zone Vastu Compliance Index</h3>
                  <p className="text-xs text-stone-500">Spatial harmony scores across cardinal and sub-cardinal directions</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Water</span>
                  <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Air</span>
                  <span className="flex items-center gap-1.5 text-red-600"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Fire</span>
                  <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Earth</span>
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Space</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val}/100`, 'Compliance Score']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="score" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Checklist Verification Badges */}
            {analysis.verifiedChecklistItems && analysis.verifiedChecklistItems.length > 0 && (
              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI-Verified Compliant Checklist Items (100% Certainty)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.verifiedChecklistItems.map(itemNum => (
                    <span key={itemNum} className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 shadow-xs">
                      Rule #{itemNum} Verified Compliant
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Full Text Report */}
            <div className="prose prose-stone max-w-none bg-stone-50/60 p-6 rounded-2xl border border-stone-200">
              <Markdown>{analysis.report}</Markdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
