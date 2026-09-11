
import { useEffect, useRef, useState } from 'react';
import { Camera, X, Compass as CompassIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveCameraProps {
  onCapture: (base64: string, mimeType: string) => void;
  onClose: () => void;
}

const ZONES = [
  { range: [337.5, 360], name: 'North', deity: 'Kubera', element: 'Water', color: 'bg-blue-500', advice: 'Ideal for living room or entrance. Enhances wealth.' },
  { range: [0, 22.5], name: 'North', deity: 'Kubera', element: 'Water', color: 'bg-blue-500', advice: 'Ideal for living room or entrance. Enhances wealth.' },
  { range: [22.5, 67.5], name: 'North-East', deity: 'Ishanya', element: 'Water', color: 'bg-teal-500', advice: 'Ideal for Pooja room or meditation. Highly sacred.' },
  { range: [67.5, 112.5], name: 'East', deity: 'Indra', element: 'Air', color: 'bg-emerald-500', advice: 'Good for living room, study, or entrance. Brings prosperity.' },
  { range: [112.5, 157.5], name: 'South-East', deity: 'Agni', element: 'Fire', color: 'bg-red-500', advice: 'Perfect for the kitchen. Governs health and energy.' },
  { range: [157.5, 202.5], name: 'South', deity: 'Yama', element: 'Earth', color: 'bg-orange-600', advice: 'Ideal for bedrooms or heavy furniture. Brings stability.' },
  { range: [202.5, 247.5], name: 'South-West', deity: 'Nairutya', element: 'Earth', color: 'bg-yellow-600', advice: 'Best for Master Bedroom. Represents strength.' },
  { range: [247.5, 292.5], name: 'West', deity: 'Varuna', element: 'Space', color: 'bg-indigo-400', advice: 'Good for dining or children\'s bedroom.' },
  { range: [292.5, 337.5], name: 'North-West', deity: 'Vayu', element: 'Air', color: 'bg-sky-400', advice: 'Good for guest rooms or parking.' },
];

function getZone(heading: number) {
  let normalized = heading % 360;
  if (normalized < 0) normalized += 360;
  return ZONES.find(z => normalized >= z.range[0] && normalized < z.range[1]) || ZONES[0];
}

export function LiveCamera({ onCapture, onClose }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    // Start Camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.error(err);
        setError('Camera access denied or unavailable.');
      });

    // Start Compass
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let h = 0;
      if ((e as any).webkitCompassHeading) {
        h = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        h = 360 - e.alpha;
      }
      setHeading(h);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      onCapture(base64, 'image/jpeg');
      onClose();
    }
  };

  const currentZone = getZone(heading);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <Camera className="w-12 h-12 mb-4 text-red-500" />
        <p className="mb-6">{error}</p>
        <button onClick={onClose} className="px-6 py-2 bg-stone-800 rounded-full">Close</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans">
      <div className="flex justify-between p-4 text-white absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
          <CompassIcon className="w-5 h-5 text-amber-400" />
          <span className="font-mono font-medium text-lg">{Math.round(heading)}°</span>
        </div>
        <button onClick={onClose} className="p-2 bg-black/50 rounded-full backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-stone-900 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover scale-105" 
        />
        
        {/* AR Overlay HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-20">
          
          {/* Dynamic AR Label */}
          <motion.div 
            key={currentZone.name}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-32 flex flex-col items-center text-center px-6 drop-shadow-2xl"
          >
            <div className={`px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-3 shadow-lg ${currentZone.color}`}>
              {currentZone.element} Element
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              {currentZone.name}
            </h2>
            <p className="text-xl text-white/90 font-medium mt-1 drop-shadow-md">
              Zone of {currentZone.deity}
            </p>
          </motion.div>

          <div className="w-72 h-72 border-[1.5px] border-white/40 rounded-full flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            {/* North Indicator */}
            <div 
              className="absolute w-full h-full transition-transform duration-75"
              style={{ transform: `rotate(-${heading}deg)` }}
            >
              <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)] border-2 border-white">N</div>
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">S</div>
              <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 bg-stone-800 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">W</div>
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-stone-800 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">E</div>
              
              {/* Tick marks for all 8 zones */}
              {[45, 135, 225, 315].map(deg => (
                <div key={deg} className="absolute w-[2px] h-3 bg-white/50 left-1/2 -ml-[1px]" style={{ transform: `rotate(${deg}deg) translateY(-144px)` }} />
              ))}
              
              {/* Crosshairs */}
              <div className="w-[1px] h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
              <div className="h-[1px] w-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
            </div>
            
            {/* Center target indicator */}
            <div className="w-12 h-12 border-2 border-amber-400 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-amber-400 rounded-full" />
            </div>
          </div>
          
          <AnimatePresence>
            {showInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-8 mx-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${currentZone.color}`} />
                  <p className="text-white/90 text-sm leading-snug">
                    {currentZone.advice}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="p-6 pb-10 flex items-center justify-between bg-black absolute bottom-0 left-0 right-0 z-20">
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
        <button 
          onClick={capture} 
          className="w-20 h-20 rounded-full border-[4px] border-white/30 bg-transparent flex items-center justify-center backdrop-blur-md active:scale-95 transition-all p-1"
        >
          <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
        </button>
        <div className="w-12 h-12" /> {/* Spacer for layout balance */}
      </div>
    </div>
  );
}
