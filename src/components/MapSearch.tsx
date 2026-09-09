import { useEffect, useRef } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<any>(null);

  useEffect(() => {
    if (!placesLib || !containerRef.current) return;
    
    // Create the new PlaceAutocompleteElement
    // Using PlaceAutocompleteElement ensures we are using Places API (New)
    const autocompleteElement = new placesLib.PlaceAutocompleteElement();
    elementRef.current = autocompleteElement;
    
    // Simple styling to make it fit
    autocompleteElement.style.width = '100%';
    autocompleteElement.style.boxSizing = 'border-box';
    
    containerRef.current.appendChild(autocompleteElement);
    
    const handlePlaceSelect = async (e: any) => {
      const place = e.place;
      if (!place) return;
      
      // fetchFields is required for Places API (New) to get geometry
      await place.fetchFields({ fields: ['location'] });
      
      const location = place.location;
      if (location) {
        if (map) {
          map.setCenter(location);
          map.setZoom(17);
        }
        onLocationSelect(location.lat(), location.lng());
      }
    };

    autocompleteElement.addEventListener('gmp-placeselect', handlePlaceSelect);
    
    return () => {
      autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
      if (containerRef.current && containerRef.current.contains(autocompleteElement)) {
        containerRef.current.removeChild(autocompleteElement);
      }
    };
  }, [placesLib, map, onLocationSelect]);

  return (
    <div 
      ref={containerRef} 
      className="w-full bg-white rounded-lg shadow-md overflow-hidden" 
      style={{ minHeight: '40px' }}
    />
  );
}
