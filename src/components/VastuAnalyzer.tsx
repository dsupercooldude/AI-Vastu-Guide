import { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, ArrowRight, X, LayoutTemplate } from 'lucide-react';
import { ConfidenceMeter } from './ConfidenceMeter';

interface VastuAnalyzerProps {
  onAnalyze: (images: {data: string, mimeType: string}[], floorPlan: {data: string, mimeType: string} | null, description: string, houseName: string) => Promise<any>;
  loading: boolean;
  confidence: number;
  onRefreshBaseline: () => void;
  isRefreshing: boolean;
  houseName: string;
}

interface ImageItem {
  id: string;
  preview: string;
  base64: string;
  mimeType: string;
}

export function VastuAnalyzer({ onAnalyze, loading, confidence, onRefreshBaseline, isRefreshing, houseName }: VastuAnalyzerProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [floorPlan, setFloorPlan] = useState<ImageItem | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({
          id: crypto.randomUUID(),
          preview: result,
          base64,
          mimeType: file.type
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFloorPlanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Floor plan size should be less than 10MB');
      return;
    }

    try {
      const item = await processFile(file);
      setFloorPlan(item);
    } catch (err) {
      setError('Failed to read file');
    }
  };

  const handlePhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const newImages = await Promise.all(files.map(f => processFile(f)));
      setImages(prev => [...prev, ...newImages]);
    } catch (err) {
      setError('Failed to read one or more files');
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 && !floorPlan) {
      setError('Please upload at least one floor plan or photo');
      return;
    }

    try {
      await onAnalyze(
        images.map(img => ({ data: img.base64, mimeType: img.mimeType })),
        floorPlan ? { data: floorPlan.base64, mimeType: floorPlan.mimeType } : null,
        description,
        houseName
      );
      // Reset form
      setImages([]);
      setFloorPlan(null);
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze images');
    }
  };

  return (
    <div className="w-full">
      <ConfidenceMeter 
        confidence={confidence} 
        onRefresh={onRefreshBaseline} 
        isRefreshing={isRefreshing} 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h2 className="text-xl font-semibold text-stone-800">New Vastu Analysis</h2>
          <p className="text-sm text-stone-500 mt-1">Upload a floor plan and multiple photos to get an AI-powered Vastu compliance report.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Floor Plan Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-amber-600" />
              1. Floor Plan (Optional but Recommended)
            </h3>
            
            {floorPlan ? (
              <div className="relative inline-block">
                <img src={floorPlan.preview} alt="Floor plan preview" className="h-40 rounded-xl border border-stone-200 object-cover" />
                <button 
                  type="button" 
                  onClick={() => setFloorPlan(null)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-stone-200 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => floorPlanInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-amber-400 transition-colors"
              >
                <LayoutTemplate className="w-8 h-8 mb-2 text-stone-400" />
                <span className="text-sm font-medium">Upload Floor Plan</span>
              </button>
            )}
            <input 
              type="file" 
              ref={floorPlanInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFloorPlanChange} 
            />
          </div>

          <hr className="border-stone-100" />

          {/* Photos Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              2. Room / Angle Photos
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative inline-block shrink-0">
                  <img src={img.preview} alt="Room preview" className="w-32 h-32 rounded-xl border border-stone-200 object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-stone-200 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex flex-col gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-32 h-[3.8rem] border border-stone-300 rounded-xl flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-50 hover:border-amber-400 transition-colors text-sm font-medium"
                >
                  <Camera className="w-4 h-4" /> Take
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
            <h3 className="font-semibold text-stone-800">3. Additional Details</h3>
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

          <button
            type="submit"
            disabled={loading || (images.length === 0 && !floorPlan)}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <>
                Analyze Complete House <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
