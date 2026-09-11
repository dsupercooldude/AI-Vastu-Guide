const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

content = content.replace(
  /devOptions: \{/,
  "workbox: { maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 },\n      devOptions: {"
);

fs.writeFileSync('vite.config.ts', content);
