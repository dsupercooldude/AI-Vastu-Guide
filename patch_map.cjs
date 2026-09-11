const fs = require('fs');

const code = `import { useEffect, useRef } from 'react';
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
    
    // Clear container
    containerRef.current.innerHTML = '';
    
    if (placesLib.PlaceAutocompleteElement) {
      const autocompleteElement = new placesLib.PlaceAutocompleteElement();
      autocompleteElement.id = "place-autocomplete-input";
      
      containerRef.current.appendChild(autocompleteElement);
      
      autocompleteElement.addEventListener('gmp-placeselect', async (e: any) => {
        const place = e.place;
        if (!place) return;
        
        try {
          // The new Places API requires fetching the fields if they aren't pre-requested
          await place.fetchFields({ fields: ['location', 'viewport'] });
          
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
          
          const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
          const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
          
          onLocationSelectRef.current(lat, lng);
        } catch (err) {
          console.error("Failed to fetch place details", err);
        }
      });
    } else {
      // Fallback text input if PlaceAutocompleteElement is unavailable
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Search for your property address...';
      input.className = 'w-full py-3 px-3 outline-none text-stone-700 font-medium bg-transparent';
      containerRef.current.appendChild(input);
      
      if (placesLib.Autocomplete) {
         const autocomplete = new placesLib.Autocomplete(input, {
           fields: ['geometry']
         });
         autocomplete.addListener('place_changed', () => {
           const place = autocomplete.getPlace();
           if (!place || !place.geometry || !place.geometry.location) return;
           const loc = place.geometry.location;
           if (map) {
             if (place.geometry.viewport) {
               map.fitBounds(place.geometry.viewport);
             } else {
               map.setCenter(loc);
               map.setZoom(17);
             }
           }
           onLocationSelectRef.current(loc.lat(), loc.lng());
         });
      }
    }

    return () => {
      if (containerRef.current) { containerRef.current.innerHTML = ''; }
    };
  }, [placesLib, map]);

  return (
    <div className="relative w-full shadow-md rounded-lg overflow-hidden bg-white flex items-center border border-stone-200">
      <div className="pl-3 text-stone-400">
        <Search className="w-5 h-5" />
      </div>
      <div ref={containerRef} className="w-full flex-1 [&>gmp-place-autocomplete]:w-full [&>gmp-place-autocomplete]:block">
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/MapSearch.tsx', code);
