const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /console\.log\(\`Model \$\{model\} failed with \$\{errorMessage\.substring\(0, 50\)\}\.\.\. falling back to next\.\`\);/g,
  `// silent fallback`
);

fs.writeFileSync('server.ts', content);
