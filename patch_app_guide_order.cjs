const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "                <VastuPlacementGuide />\n                <div className=\"mt-8\"></div>\n                <VastuAnalyzer ",
  "                <VastuAnalyzer "
);

code = code.replace(
  "                  houseId={currentHouseId || ''}\n                />",
  "                  houseId={currentHouseId || ''}\n                />\n                <div className=\"mt-8\"></div>\n                <VastuPlacementGuide />"
);

fs.writeFileSync('src/App.tsx', code);
