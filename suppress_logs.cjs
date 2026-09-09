const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /console\.error\(\`Error with model \$\{model\}:\`, error\.message\);\n\s*const errorMessage = \(error\.message \|\| ''\) \+ ' ' \+ JSON\.stringify\(error\);/g,
  `const errorMessage = (error.message || '') + ' ' + JSON.stringify(error);
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('400') || errorMessage.includes('not found') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {
          console.warn(\`Model \${model} is currently overloaded or rate-limited. Trying fallback...\`);
        } else {
          console.error(\`Error with model \${model}:\`, error.message);
        }`
);

fs.writeFileSync('server.ts', content);
