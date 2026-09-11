const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "setVerified(result.verifiedChecklistItems);",
  "setVerified(result.verifiedChecklistItems);\n    }\n    setActiveTab('history');\n    // we still return result below"
);

fs.writeFileSync('src/App.tsx', code);
