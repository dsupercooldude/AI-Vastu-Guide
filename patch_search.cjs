const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/tools:\s*\[\{\s*googleSearch:\s*\{\}\s*\}\]/g, '/* removed googleSearch */');

content = content.replace(
  "const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];",
  "const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];"
);

fs.writeFileSync('server.ts', content);
