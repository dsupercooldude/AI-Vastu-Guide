const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<div className="md:hidden bg-white px-4 py-3 border-b border-stone-200 flex items-center justify-between shadow-sm z-40">/g,
  '<div className="md:hidden bg-white px-4 py-3 border-b border-stone-200 flex items-center justify-between shadow-sm relative z-40">'
);

fs.writeFileSync('src/App.tsx', content);
