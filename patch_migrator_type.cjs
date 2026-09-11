const fs = require('fs');
let code = fs.readFileSync('src/components/DataMigrator.tsx', 'utf8');

code = code.replace(
  "const stripUndefined = (obj) => {",
  "const stripUndefined = (obj: any) => {"
);

fs.writeFileSync('src/components/DataMigrator.tsx', code);
