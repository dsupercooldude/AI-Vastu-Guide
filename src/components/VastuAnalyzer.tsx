import Markdown from 'react-markdown';
import { useState, useRef, useEffect } from 'react';
import { Camera, Activity, Upload, AlertCircle, ArrowRight, X, LayoutTemplate, Plus, Maximize2, RefreshCw, MapPin, Trash2 } from 'lucide-react';
import { ConfidenceMeter } from './ConfidenceMeter';
import { LiveCamera } from './LiveCamera';
import { AIEngineUsage } from './AIEngineUsage';
import { VastuMap } from './VastuMap';
import { Compass } from './Compass';
import { ImageOverlayModal } from './ImageOverlayModal';
import { compressImage, saveHouseImages, getHouseImages, deleteImage, ImageItem } from '../utils/imageUtils';

interface VastuAnalyzerProps {
  onAnalyze: (images: {data: string, mimeType: string}[], floorPlans: {data: string, mimeType: string}[], description: string, houseName: string) => Promise<any>;
  loading: boolean;
  confidence: number;
  onRefreshBaseline: () => void;
  isRefreshing: boolean;
  houseName: string;
  houseId: string;
  latestInsight?: string | null;
}



export function VastuAnalyzer({ onAnalyze, loading, confidence, onRefreshBaseline, isRefreshing, houseName, houseId, latestInsight }: VastuAnalyzerProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [floorPlans, setFloorPlans] = useState<ImageItem[]>([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState('');
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [partialReport, setPartialReport] = useState('');
  
  useEffect(() => {
    const handlePartial = (e: any) => {
      if (e.detail) setPartialReport(e.detail);
      else setPartialReport('');
    };
    window.addEventListener('vastu_partial_report', handlePartial);
    return () => window.removeEventListener('vastu_partial_report', handlePartial);
  }, []);
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);
  const [retakeImageId, setRetakeImageId] = useState<string | null>(null);
  
  const [loadingStage, setLoadingStage] = useState(0);

  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (houseId) {
      getHouseImages(houseId, 'photos').then(setImages);
      getHouseImages(houseId, 'floorPlans').then(setFloorPlans);
    } else {
      setImages([]);
      setFloorPlans([]);
    }
  }, [houseId]);


  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage(prev => (prev < 2 ? prev + 1 : prev));
      }, 3500); // move to next stage every 3.5 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingStages = [
    "Processing images and mapping floor plans...",
    "Calculating spatial Vastu vectors...",
    "Generating comprehensive AI report..."
  ];

  const processFile = compressImage;

  const handleFloorPlansChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Floor plan size should be less than 10MB');
        return;
      }
    }
     
    try {
      const newFloorPlans = await Promise.all(files.map(f => processFile(f)));
      setFloorPlans(prev => {
        const next = [...prev, ...newFloorPlans];
        if (houseId) saveHouseImages(houseId, 'floorPlans', next);
        return next;
      });
    } catch (err) {
      setError('Failed to read one or more files');
    }
  };

  const handlePhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
     
    try {
      const newImages = await Promise.all(files.map(f => processFile(f)));
      setImages(prev => {
        const next = [...prev, ...newImages];
        if (houseId) saveHouseImages(houseId, 'photos', next);
        return next;
      });
    } catch (err) {
      setError('Failed to read one or more files');
    }
  };

  const handleCameraCapture = (base64: string, mimeType: string) => {
    if (retakeImageId) {
      if (images.find(img => img.id === retakeImageId)) {
        setImages(prev => prev.map(img => 
          img.id === retakeImageId 
            ? { id: retakeImageId, preview: `data:${mimeType};base64,${base64}`, base64, mimeType }
            : img
        ));
      } else {
        setFloorPlans(prev => prev.map(img => 
          img.id === retakeImageId 
            ? { id: retakeImageId, preview: `data:${mimeType};base64,${base64}`, base64, mimeType }
            : img
        ));
      }
      setRetakeImageId(null);
    } else {
      setImages(prev => [...prev, {
        id: crypto.randomUUID(),
        preview: `data:${mimeType};base64,${base64}`,
        base64,
        mimeType
      }]);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (houseId) deleteImage(houseId, 'photos', id);
  };
  
  const removeFloorPlan = (id: string) => {
    setFloorPlans(prev => prev.filter(img => img.id !== id));
    if (houseId) deleteImage(houseId, 'floorPlans', id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 && floorPlans.length === 0) {
      setError('Please upload at least one floor plan or photo');
      return;
    }
    try {
      const locationContext = location ? `\nProperty coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Please note its magnetic orientation based on these coordinates.` : '';
      await onAnalyze(
        images.map(img => ({ data: img.base64 || img.preview, mimeType: img.mimeType })),
        floorPlans.map(fp => ({ data: fp.base64 || fp.preview, mimeType: fp.mimeType })),
        description + locationContext,
        houseName
      );
      // Reset form
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze images');
    }
  };

  return (
    <div className="w-full">
      {isCameraOpen && (
        <LiveCamera 
          onCapture={handleCameraCapture} 
          onClose={() => { setIsCameraOpen(false); setRetakeImageId(null); }} 
        />
      )}
      
      {previewImage && (
        <ImageOverlayModal
          src={previewImage.preview}
          onClose={() => setPreviewImage(null)}
          actions={
            <>
              <button
                onClick={() => {
                  setRetakeImageId(previewImage.id);
                  setPreviewImage(null);
                  setIsCameraOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" /> Retake Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  if (images.find(img => img.id === previewImage.id)) {
                    removeImage(previewImage.id);
                  } else {
                    removeFloorPlan(previewImage.id);
                  }
                  setPreviewImage(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="w-5 h-5" /> Remove
              </button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="flex items-center gap-2 px-6 py-3 bg-stone-500/20 hover:bg-stone-500/40 text-stone-100 rounded-xl font-medium transition-colors"
              >
                <X className="w-5 h-5" /> Close
              </button>
            </>
          }
        />
      )}

      <AIEngineUsage />
      <ConfidenceMeter 
        confidence={confidence} 
        onRefresh={onRefreshBaseline} 
        isRefreshing={isRefreshing} 
        latestInsight={latestInsight}
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h2 className="text-xl font-semibold text-stone-800">New Vastu Analysis</h2>
          <p className="text-sm text-stone-500 mt-1">Upload floor plans and multiple photos to get an AI-powered Vastu compliance report.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Floor Plan Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-amber-600" />
              1. Floor Plan (Optional but Recommended)
            </h3>
            
            {floorPlans.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {floorPlans.map((fp) => (
                  <div key={fp.id} className="relative inline-block shrink-0">
                    <div className="group relative w-32 h-32 rounded-xl border border-stone-200 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(fp)}>
                      <img src={fp.preview} alt="Floor plan preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFloorPlan(fp.id)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-stone-200 hover:text-red-500 z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={() => floorPlanInputRef.current?.click()}
                  className="w-32 h-32 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-amber-400 transition-colors"
                >
                  <Plus className="w-6 h-6 mb-1 text-stone-400" />
                  <span className="text-xs font-medium">Add More</span>
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => floorPlanInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-amber-400 transition-colors"
              >
                <LayoutTemplate className="w-8 h-8 mb-2 text-stone-400" />
                <span className="text-sm font-medium">Upload Floor Plan(s)</span>
              </button>
            )}
            <input 
              type="file" 
              ref={floorPlanInputRef} 
              className="hidden" 
              accept="image/*"
              multiple
              onChange={handleFloorPlansChange} 
            />
          </div>

          <hr className="border-stone-100" />

          {/* Map Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              2. Property Location & Orientation
            </h3>
            <p className="text-sm text-stone-500 mb-2">Pin your house location to determine precise magnetic north alignment.</p>
            <VastuMap onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
          </div>

          <hr className="border-stone-100" />

          {/* Photos Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              3. Room / Angle Photos
            </h3>
            <div className="my-4">
              <Compass />
            </div>
            
            <div className="flex flex-wrap gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative inline-block shrink-0">
                  <div className="group relative w-32 h-32 rounded-xl border border-stone-200 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(img)}>
                    <img src={img.preview} alt="Room preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-stone-200 hover:text-red-500 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex flex-col gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => {
                    const req = typeof window !== 'undefined' && (window as any).DeviceOrientationEvent?.requestPermission;
                    if (typeof req === 'function') {
                      req().then((permission: string) => {
                        if (permission === 'granted') setIsCameraOpen(true);
                      }).catch((e: any) => {
                        setIsCameraOpen(true);
                      });
                    } else {
                      setIsCameraOpen(true);
                    }
                  }}
                  className="w-32 h-[3.8rem] border border-amber-300 bg-amber-50 rounded-xl flex items-center justify-center gap-2 text-amber-700 hover:bg-amber-100 hover:border-amber-400 transition-colors text-sm font-bold shadow-sm"
                >
                  <Camera className="w-4 h-4" /> AR Scanner
                </button>
                <button 
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-32 h-[3.8rem] border border-stone-300 rounded-xl flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-50 hover:border-amber-400 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" /> Upload
                </button>
              </div>
            </div>
            <input 
              type="file" 
              ref={photoInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple
              onChange={handlePhotosChange} 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handlePhotosChange} 
            />
          </div>

          <hr className="border-stone-100" />

          {/* Details Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800">4. Additional Details</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., This is a north-facing house. The second photo is the master bedroom..."
              className="w-full h-24 px-4 py-3 border border-stone-300 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="w-full bg-amber-50 rounded-xl p-4 flex flex-col gap-3 border border-amber-200">
              <div className="flex items-center justify-between text-sm font-bold text-amber-700">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                  {loadingStages[loadingStage]}
                </span>
                <span>{Math.round(((loadingStage + 1) / 3) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-amber-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((loadingStage + 1) / 3) * 100}%` }}
                />
              </div>
              {partialReport && (
                <div className="mt-4 p-4 bg-white/60 border border-amber-200 rounded-lg text-sm text-stone-700">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500"/> Live Analysis Stream</h4>
                  <div className="prose prose-sm max-w-none prose-amber"><Markdown>{partialReport}</Markdown></div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="submit"
              disabled={images.length === 0 && floorPlans.length === 0}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Analyze Complete House <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
