import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, MapControl, ControlPosition, useMap } from '@vis.gl/react-google-maps';
import { Compass } from 'lucide-react';
import { MapSearch } from './MapSearch';

interface VastuMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
}





function MapController({ position, onLocation }: { position: {lat: number, lng: number}, onLocation: (lat: number, lng: number) => void }) {
  const map = useMap();
  const onLocationRef = React.useRef(onLocation);
  const initialized = React.useRef(false);

  React.useEffect(() => {
    onLocationRef.current = onLocation;
  }, [onLocation]);

  useEffect(() => {
    if (navigator.geolocation && map && !initialized.current) {
      initialized.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          onLocationRef.current(lat, lng);
          map.panTo({ lat, lng });
          map.setZoom(16);
        },
        (err) => {
          console.warn("Geolocation warning:", err.message || err);
        }
      );
    }
  }, [map]);

  useEffect(() => {
    if (map && initialized.current) {
      map.panTo(position);
    }
  }, [map, position]);

  return null;
}

export function VastuMap({ onLocationSelect }: VastuMapProps) {
  const [position, setPosition] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-64 bg-stone-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-stone-300 p-6 text-center">
        <Compass className="w-12 h-12 text-stone-400 mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Map Not Configured</h3>
        <p className="text-sm text-stone-500 mt-2 max-w-sm">
          Please add your VITE_GOOGLE_MAPS_API_KEY in the settings to enable property location mapping.
        </p>
      </div>
    );
  }

  


  const handleMapClick = (e: any) => {
    if (e.detail.latLng) {
      handleLocationUpdate(e.detail.latLng.lat, e.detail.latLng.lng);
    }
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    if (onLocationSelect) onLocationSelect(lat, lng);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative" style={{ height: '400px' }}>
      <APIProvider apiKey={apiKey} libraries={['places']} version="beta">
        <Map
          defaultZoom={15}
          defaultCenter={position}
          mapId="DEMO_MAP_ID"
          onClick={handleMapClick}
          disableDefaultUI={true}
          gestureHandling="greedy"
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        >
          <MapController position={position} onLocation={handleLocationUpdate} />
          <MapControl position={ControlPosition.TOP_CENTER}>
            <div className="mt-4 px-4 w-full min-w-[300px] sm:min-w-[400px]">
              <MapSearch onLocationSelect={handleLocationUpdate} />
            </div>
          </MapControl>
          
          
          <AdvancedMarker position={position}>
            <div className="relative flex items-center justify-center">
              {/* Compass overlay around the pin */}
              <div className="absolute w-32 h-32 border-2 border-amber-500/30 rounded-full flex items-center justify-center pointer-events-none">
                <div className="absolute top-0 text-[10px] font-bold text-red-500 -mt-4">N</div>
                <div className="absolute right-0 text-[10px] font-bold text-stone-600 -mr-4">E</div>
                <div className="absolute bottom-0 text-[10px] font-bold text-stone-600 -mb-4">S</div>
                <div className="absolute left-0 text-[10px] font-bold text-stone-600 -ml-4">W</div>
                
                <div className="absolute w-full h-[1px] bg-amber-500/20"></div>
                <div className="absolute h-full w-[1px] bg-amber-500/20"></div>
              </div>
              <Pin background="#d97706" borderColor="#92400e" glyphColor="#fff" />
            </div>
          </AdvancedMarker>
        </Map>
      </APIProvider>
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-stone-200 pointer-events-none flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Property Orientation</p>
          <p className="text-xs text-stone-500 mt-0.5">Click map to set property location</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-stone-600">{position.lat.toFixed(4)}° N</p>
          <p className="text-xs font-mono text-stone-600">{position.lng.toFixed(4)}° E</p>
        </div>
      </div>
    </div>
  );
}
