import { useEffect, useRef } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Search } from 'lucide-react';

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const onLocationSelectRef = useRef(onLocationSelect);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!placesLib || !containerRef.current) return;
    
    containerRef.current.innerHTML = '';
    
    if (placesLib.PlaceAutocompleteElement) {
       const autocompleteElement = new (placesLib as any).PlaceAutocompleteElement();
       autocompleteElement.id = 'place-autocomplete-input';
       
       // Add some styling to match the previous input
       const style = document.createElement('style');
       style.textContent = `
         gmp-place-autocomplete {
           width: 100%;
           display: block;
         }
         gmp-place-autocomplete::part(input) {
           width: 100%;
           padding: 0.75rem;
           outline: none;
           color: #44403c;
           font-weight: 500;
           background: transparent;
           border: none;
           box-sizing: border-box;
         }
       `;
       containerRef.current.appendChild(style);
       containerRef.current.appendChild(autocompleteElement);
       
       const handlePlaceChanged = async (e: any) => {
         const place = e.place;
         if (!place) return;
         
         await place.fetchFields({
           fields: ['location', 'viewport']
         });
         
         if (!place.location) return;
         
         const loc = place.location;
         
         if (map) {
           if (place.viewport) {
             map.fitBounds(place.viewport);
           } else {
             map.setCenter(loc);
             map.setZoom(17);
           }
         }
         
         const latVal = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
         const lngVal = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
         onLocationSelectRef.current(Number(latVal), Number(lngVal));
       };
       
       autocompleteElement.addEventListener('gmp-placeselect', handlePlaceChanged);
       
       return () => {
         autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceChanged);
       }
    }
  }, [placesLib, map]);

  return (
    <div className="relative w-full shadow-md rounded-lg overflow-hidden bg-white flex items-center border border-stone-200">
      <div className="pl-3 text-stone-400">
        <Search className="w-5 h-5" />
      </div>
      <div ref={containerRef} className="w-full flex-1">
      </div>
    </div>
  );
}