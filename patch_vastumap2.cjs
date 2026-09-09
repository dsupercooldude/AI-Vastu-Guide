const fs = require('fs');
let content = fs.readFileSync('src/components/VastuMap.tsx', 'utf8');

// Replace center with defaultCenter
content = content.replace(/center=\{position\}/, 'defaultCenter={position}');

// Import useMap
content = content.replace(
  /import \{ APIProvider, Map, AdvancedMarker, Pin, MapControl, ControlPosition \} from '@vis\.gl\/react-google-maps';/,
  "import { APIProvider, Map, AdvancedMarker, Pin, MapControl, ControlPosition, useMap } from '@vis.gl/react-google-maps';"
);

// Add MapUpdater component
const mapUpdater = `
function MapUpdater({ position }: { position: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(position);
    }
  }, [position, map]);
  return null;
}
`;

content = content.replace(
  /export function VastuMap/,
  mapUpdater + '\nexport function VastuMap'
);

// Add MapUpdater inside Map
content = content.replace(
  /<AdvancedMarker position=\{position\}>/,
  "<MapUpdater position={position} />\n          <AdvancedMarker position={position}>"
);

fs.writeFileSync('src/components/VastuMap.tsx', content);
