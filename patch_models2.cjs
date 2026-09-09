const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  "const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];",
  "const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];"
);

fs.writeFileSync('server.ts', content);
