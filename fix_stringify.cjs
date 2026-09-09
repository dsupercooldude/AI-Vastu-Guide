const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the stringify with a safer version
content = content.replace(
  /const errorMessage = \(error\.message \|\| ''\) \+ ' ' \+ JSON\.stringify\(error\);/g,
  `let errorString = '';
        try { errorString = JSON.stringify(error); } catch(e) { errorString = String(error); }
        const errorMessage = (error.message || '') + ' ' + errorString;`
);

fs.writeFileSync('server.ts', content);
