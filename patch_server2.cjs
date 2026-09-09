const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /promptText \+\= \`Task: If floor plans are provided.*?fixes\.\`;/s,
  `promptText += JSON_PROMPT_INSTRUCTION;`
);

fs.writeFileSync('server.ts', content);
