const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Update the error catching logic to be even more robust
content = content.replace(
  /const errorMessage = error\.message \|\| '';/g,
  "const errorMessage = (error.message || '') + ' ' + JSON.stringify(error);"
);

fs.writeFileSync('server.ts', content);
