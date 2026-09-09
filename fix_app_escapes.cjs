const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the escaped characters
content = content.replace(/key=\{\\\`fp-\\\$\{i\}\\\`\}/g, 'key={`fp-${i}`}');
content = content.replace(/alt=\{\\\`Floor Plan \\\$\{i\}\\\`\}/g, 'alt={`Floor Plan ${i}`}');
content = content.replace(/alt=\{\\\`Room \\\$\{i\}\\\`\}/g, 'alt={`Room ${i}`}');

fs.writeFileSync('src/App.tsx', content);
