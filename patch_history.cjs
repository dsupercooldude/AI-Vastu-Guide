const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAnalysisHistory.ts', 'utf8');

code = code.replace(
  /images: images\.map\(img => \`data:\$\{img\.mimeType\};base64,\$\{img\.data\}\`\),/g,
  ""
);

code = code.replace(
  /if \(floorPlans\.length > 0\) \{\s*newAnalysis\.floorPlans = floorPlans\.map\(fp => \`data:\$\{fp\.mimeType\};base64,\$\{fp\.data\}\`\);\s*\}/g,
  ""
);

fs.writeFileSync('src/hooks/useAnalysisHistory.ts', code);
