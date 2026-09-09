const fs = require('fs');

let content = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

// Change type to any to avoid ts error
content = content.replace(/const autocompleteRef = useRef<google\.maps\.places\.Autocomplete \| null>\(null\);/, 'const autocompleteRef = useRef<any>(null);');

fs.writeFileSync('src/components/MapSearch.tsx', content);

let mapContent = fs.readFileSync('src/components/VastuMap.tsx', 'utf8');
mapContent = mapContent.replace(/<APIProvider apiKey=\{apiKey\}>/, "<APIProvider apiKey={apiKey} libraries={['places']}>");
fs.writeFileSync('src/components/VastuMap.tsx', mapContent);

