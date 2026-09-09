const fs = require('fs');
let content = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

content = content.replace(
  /if \(containerRef\.current && autocompleteElement\) \{\s*containerRef\.current\.innerHTML = '';\s*\}/g,
  "if (containerRef.current) { containerRef.current.innerHTML = ''; }"
);

fs.writeFileSync('src/components/MapSearch.tsx', content);
