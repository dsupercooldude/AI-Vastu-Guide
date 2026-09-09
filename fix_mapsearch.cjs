const fs = require('fs');
let content = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

// We need to keep a ref to the latest onLocationSelect
content = content.replace(
  /export function MapSearch\(\{ onLocationSelect \}: MapSearchProps\) \{/,
  `export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);`
);

// Update calls to use the ref
content = content.replace(/onLocationSelect\(location\.lat\(\), location\.lng\(\)\);/g, "onLocationSelectRef.current(location.lat(), location.lng());");
content = content.replace(/onLocationSelect\(loc\.lat\(\), loc\.lng\(\)\);/g, "onLocationSelectRef.current(loc.lat(), loc.lng());");

// Remove onLocationSelect from dependencies
content = content.replace(/\[placesLib, map, onLocationSelect\]/g, "[placesLib, map]");

fs.writeFileSync('src/components/MapSearch.tsx', content);
