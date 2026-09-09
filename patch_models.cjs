const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  "const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];",
  "const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];"
);
fs.writeFileSync('server.ts', content);
