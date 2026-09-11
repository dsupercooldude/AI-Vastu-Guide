const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "    setActiveTab('history');\n    // we still return result below\n    }\n    return result;",
  "    setActiveTab('history');\n    return result;"
);

fs.writeFileSync('src/App.tsx', code);
