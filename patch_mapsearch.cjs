const fs = require('fs');

let content = fs.readFileSync('src/components/MapSearch.tsx', 'utf8');

content = content.replace(
  /if \(placesLib\.PlaceAutocompleteElement\) \{/,
  "if (false) {" // Force fallback to legacy Autocomplete
);

fs.writeFileSync('src/components/MapSearch.tsx', content);
