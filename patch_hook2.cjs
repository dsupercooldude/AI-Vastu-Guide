const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAnalysisHistory.ts', 'utf8');

content = content.replace(
  'score: data.score,',
  'score: data.score,\n        houseName: houseName,'
);

fs.writeFileSync('src/hooks/useAnalysisHistory.ts', content);
