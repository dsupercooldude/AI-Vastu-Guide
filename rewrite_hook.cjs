const fs = require('fs');

let content = fs.readFileSync('src/hooks/useAnalysisHistory.ts', 'utf8');

content = content.replace('report: data.result,', 'report: data.result,\n        score: data.score,');

fs.writeFileSync('src/hooks/useAnalysisHistory.ts', content);
