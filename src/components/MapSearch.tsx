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

    // Use the new PlaceAutocompleteElement as requested to avoid deprecation warnings
    let autocompleteElement: any = null;
    
    try {
      if (placesLib.PlaceAutocompleteElement) {
        autocompleteElement = new placesLib.PlaceAutocompleteElement();
        autocompleteElement.id = "place-autocomplete-input";
        // Append it to our container
        containerRef.current?.appendChild(autocompleteElement);
        
        // Add event listener for when a place is selected
        autocompleteElement.addEventListener('gmp-placeselect', (e: any) => {
          const place = e.place;
          if (!place || !place.location) return;
          
          const location = place.location;
          
          if (map) {
            if (place.viewport) {
              map.fitBounds(place.viewport);
            } else {
              map.setCenter(location);
              map.setZoom(17);
            }
          }
          
          onLocationSelectRef.current(location.lat(), location.lng());
        });
      } else {
         // fallback if new element isn't available
         const input = document.createElement('input');
         input.type = 'text';
         input.placeholder = 'Search for your property address...';
         input.className = 'w-full py-3 px-3 outline-none text-stone-700 font-medium bg-transparent';
         containerRef.current?.appendChild(input);
         
         const fallbackAutocomplete = new placesLib.Autocomplete(input, {
           fields: ['geometry', 'name', 'formatted_address']
         });
         
         fallbackAutocomplete.addListener('place_changed', () => {
           const place = fallbackAutocomplete.getPlace();
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
    } catch (e) {
      console.error("Autocomplete element setup failed", e);
    }

    return () => {
      if (containerRef.current) { containerRef.current.innerHTML = ''; }
    };
  }, [placesLib, map]);

  return (
    <div className="relative w-full shadow-md rounded-lg overflow-hidden bg-white flex items-center">
      <div className="pl-3 text-stone-400">
        <Search className="w-5 h-5" />
      </div>
      <div ref={containerRef} className="w-full flex-1 [&>gmp-place-autocomplete]:w-full [&>gmp-place-autocomplete]:block">
        {/* The autocomplete element will be injected here */}
      </div>
    </div>
  );
}
