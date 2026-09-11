const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Remove from ChatMessage
code = code.replace(
  "  verifiedChecklistItems?: number[];\n  remedies?: VastuRemedy[];",
  "  verifiedChecklistItems?: number[];"
);

// Add to AnalysisHistory
code = code.replace(
  "  verifiedChecklistItems?: number[];\n}",
  "  verifiedChecklistItems?: number[];\n  remedies?: VastuRemedy[];\n}"
);

fs.writeFileSync('src/types.ts', code);
