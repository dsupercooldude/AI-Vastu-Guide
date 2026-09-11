const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAnalysisHistory.ts', 'utf8');

code = code.replace(
  /verifiedChecklistItems: data\.verifiedChecklistItems,/,
  `verifiedChecklistItems: data.verifiedChecklistItems,
        remedies: data.remedies,`
);

fs.writeFileSync('src/hooks/useAnalysisHistory.ts', code);
