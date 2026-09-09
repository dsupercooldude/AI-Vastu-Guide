const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /if \(errorMessage\.includes\('429'\) \|\| errorMessage\.includes\('quota'\) \|\| errorMessage\.includes\('404'\)\) \{/g,
  `if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {`
);

fs.writeFileSync('server.ts', content);
