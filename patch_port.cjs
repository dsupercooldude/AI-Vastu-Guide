const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  /const port = process\.env\.PORT \|\| 3000;\n  app\.listen\(port, \(\) => \{\n    console\.log\(\`Server running on port \$\{port\}\`\);\n  \}\);/,
  `app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });`
);
fs.writeFileSync('server.ts', content);
