import { useEffect, useRef, useState } from 'react';
import { Camera, X, Compass as CompassIcon } from 'lucide-react';

interface LiveCameraProps {
  onCapture: (base64: string, mimeType: string) => void;
  onClose: () => void;
}

export function LiveCamera({ onCapture, onClose }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState('');

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
      // iOS
      if ((e as any).webkitCompassHeading) {
        h = (e as any).webkitCompassHeading;
      } 
      // Android / Standard
      else if (e.alpha !== null) {
        h = 360 - e.alpha;
      }
      setHeading(h);
    };

    // Need to request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response == 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

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
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between p-4 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
          <CompassIcon className="w-5 h-5 text-amber-500 transition-transform duration-200" style={{ transform: `rotate(-\${heading}deg)` }} />
          <span className="font-mono font-medium">{Math.round(heading)}°</span>
        </div>
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-stone-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover" 
        />
        
        {/* Compass Overlay HUD */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/20 rounded-full flex items-center justify-center relative">
            {/* North Indicator */}
            <div 
              className="absolute w-full h-full transition-transform duration-200"
              style={{ transform: `rotate(-\${heading}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">N</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-stone-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">S</div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">W</div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-stone-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">E</div>
              
              {/* Crosshairs */}
              <div className="w-[1px] h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
              <div className="h-[1px] w-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
            </div>
            
            {/* Center target */}
            <div className="w-8 h-8 border-2 border-amber-500 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="p-8 pb-12 flex justify-center bg-black absolute bottom-0 left-0 right-0">
        <button 
          onClick={capture} 
          className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center backdrop-blur-md active:bg-white/40 transition-colors"
        >
          <div className="w-16 h-16 bg-white rounded-full" />
        </button>
      </div>
    </div>
  );
}
