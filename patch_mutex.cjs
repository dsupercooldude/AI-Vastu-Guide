const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /class ModelMutexes {\s*constructor\(\) {\s*this\.mutexes = \{\};\s*}/,
  `class ModelMutexes {\n  mutexes: Record<string, any>;\n  constructor() {\n    this.mutexes = {};\n  }`
);

fs.writeFileSync('server.ts', content);
