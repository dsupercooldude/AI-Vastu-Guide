const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { VastuPlacementGuide } from './components/VastuPlacementGuide';",
  "import { VastuPlacementGuide } from './components/VastuPlacementGuide';\nimport { HouseNumerology } from './components/HouseNumerology';"
);

code = code.replace(
  "                <VastuPlacementGuide />\n              </div>",
  "                <VastuPlacementGuide />\n                <div className=\"mt-8\"></div>\n                <HouseNumerology />\n              </div>"
);

fs.writeFileSync('src/App.tsx', code);
