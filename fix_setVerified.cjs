const fs = require('fs');
let content = fs.readFileSync('src/hooks/useChecklist.ts', 'utf8');

content = content.replace(
  /const next = \[\.\.\.new Set\(\[\.\.\.checkedItems, \.\.\.ids\]\)\];/,
  "const safeIds = Array.isArray(ids) ? ids : [];\n    const next = [...new Set([...checkedItems, ...safeIds])];"
);

fs.writeFileSync('src/hooks/useChecklist.ts', content);
