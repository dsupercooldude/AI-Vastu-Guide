const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /app\.use\(express\.static\(path\.join\(__dirname, '\.\.', 'dist', 'client'\)\)\);/,
  `app.use(express.static(path.join(process.cwd(), 'dist')));`
);

content = content.replace(
  /res\.sendFile\(path\.join\(__dirname, '\.\.', 'dist', 'client', 'index\.html'\)\);/,
  `res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));`
);

fs.writeFileSync('server.ts', content);
