import { useState, useEffect, useCallback } from 'react';
import { Compass as CompassIcon, AlertCircle } from 'lucide-react';

interface CompassProps {
  onDirectionDetected?: (direction: string) => void;
}

export function Compass({ onDirectionDetected }: CompassProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const getDirectionText = (degrees: number) => {
    const val = Math.floor((degrees / 45) + 0.5);
    const arr = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    return arr[(val % 8)];
  };

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let newHeading = null;
    
    // iOS property
    if ((event as any).webkitCompassHeading) {
      newHeading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android property
      newHeading = 360 - event.alpha;
    }
    
    if (newHeading !== null) {
      setHeading(newHeading);
      if (onDirectionDetected) {
        onDirectionDetected(getDirectionText(newHeading));
      }
    }
  }, [onDirectionDetected]);

  const startCompass = () => {
    const req = typeof window !== 'undefined' && (window as any).DeviceOrientationEvent?.requestPermission;
    if (typeof req === 'function') {
      req().then((permissionState: string) => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setStarted(true);
        } else {
          setError('Permission to access device orientation was denied.');
        }
      }).catch(console.error);
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setStarted(true);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
    };
  }, [handleOrientation]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-stone-200">
      <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
        <CompassIcon className="w-5 h-5 text-amber-600" />
        Vastu Compass
      </h3>
      
      {!started && !error ? (
        <button 
          onClick={startCompass}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-full transition-colors"
        >
          Calibrate & Start Compass
        </button>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 rounded-full border-4 border-amber-100 flex items-center justify-center shadow-inner">
            {/* The outer ring marks */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute top-2 font-bold text-red-600">N</span>
              <span className="absolute bottom-2 font-bold text-stone-400">S</span>
              <span className="absolute right-2 font-bold text-stone-400">E</span>
              <span className="absolute left-2 font-bold text-stone-400">W</span>
            </div>
            
            {/* The needle */}
            <div 
              className="relative w-full h-full transition-transform duration-300 ease-out"
              style={{ transform: `rotate(\${heading || 0}deg)` }}
            >
              <div className="absolute top-1/2 left-1/2 w-1 h-20 -mt-20 -ml-[2px] bg-red-500 rounded-t-full origin-bottom"></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-20 -ml-[2px] bg-stone-300 rounded-b-full origin-top"></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 bg-amber-600 rounded-full border-2 border-white z-10"></div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-3xl font-light text-stone-800">{heading ? Math.round(heading) : 0}°</div>
            <div className="text-xl font-medium text-amber-700">{heading ? getDirectionText(heading) : 'Calculating...'}</div>
          </div>
        </div>
      )}
      <p className="text-xs text-stone-500 mt-6 text-center max-w-xs">
        Point your device towards the target room or object to get its direction relative to the center of your house.
      </p>
    </div>
  );
}
