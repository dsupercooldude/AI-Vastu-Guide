const fs = require('fs');
let content = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

content = content.replace(/\\\`data:\\\$\\{mimeType\\};base64,\\\$\\{base64\\}\\\`/g, '`data:${mimeType};base64,${base64}`');
content = content.replace(/\\`data:\\\$\\{mimeType\\};base64,\\\$\\{base64\\}\\`/g, '`data:${mimeType};base64,${base64}`');

// It looks like it literally says \`data:\${mimeType};base64,\${base64}\` in the file.
content = content.replace(/\\\`data:\\\$\\{mimeType\\};base64,\\\$\\{base64\\}\\\`/g, '`data:${mimeType};base64,${base64}`');

fs.writeFileSync('src/components/VastuAnalyzer.tsx', content);
