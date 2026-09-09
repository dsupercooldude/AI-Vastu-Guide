const fs = require('fs');
let content = fs.readFileSync('src/components/VastuMap.tsx', 'utf8');

// replace defaultCenter={position} with center={position}
content = content.replace(/defaultCenter=\{position\}/, 'center={position}');

// Add geolocation
const geoEffect = `
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition({ lat, lng });
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }
  }, []);
`;

content = content.replace(
  /const handleMapClick =/,
  geoEffect + '\n  const handleMapClick ='
);

fs.writeFileSync('src/components/VastuMap.tsx', content);
