const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  "lastError = error;",
  "lastError = error;\n        console.error(`Error with model ${model}:`, error.message);"
);

fs.writeFileSync('server.ts', content);
