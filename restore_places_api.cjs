const fs = require('fs');
let content = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

content = content.replace(
  /if \(false\) \{/,
  "if (placesLib.PlaceAutocompleteElement) {"
);

fs.writeFileSync('src/components/MapSearch.tsx', content);
