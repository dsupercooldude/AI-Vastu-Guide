const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { VastuChecklist } from './components/VastuChecklist';",
  "import { VastuChecklist } from './components/VastuChecklist';\nimport { VastuPlacementGuide } from './components/VastuPlacementGuide';"
);

code = code.replace(
  "                <VastuAnalyzer ",
  "                <VastuPlacementGuide />\n                <div className=\"mt-8\"></div>\n                <VastuAnalyzer "
);

fs.writeFileSync('src/App.tsx', code);
