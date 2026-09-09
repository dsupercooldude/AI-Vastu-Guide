const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(errorMessage\.includes\('429'\) \|\| errorMessage\.includes\('quota'\) \|\| errorMessage\.includes\('404'\) \|\| errorMessage\.includes\('RESOURCE_EXHAUSTED'\)\) \{/g;
const replacement = "if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {";

content = content.replace(regex, replacement);

fs.writeFileSync('server.ts', content);
