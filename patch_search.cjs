const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace filter logic
content = content.replace(
  /\/\/ House name match\s*const hName = item\.houseName\?\.toLowerCase\(\) \|\| '';\s*const q = searchQuery\.toLowerCase\(\);\s*if \(q && !hName\.includes\(q\)\) return false;/g,
  `// Global match
                const q = searchQuery.toLowerCase();
                if (q) {
                  const hName = item.houseName?.toLowerCase() || '';
                  const desc = item.description?.toLowerCase() || '';
                  const rep = item.report?.toLowerCase() || '';
                  if (!hName.includes(q) && !desc.includes(q) && !rep.includes(q)) {
                    return false;
                  }
                }`
);

// Update placeholder
content = content.replace(
  /placeholder="Search by name\.\.\."/,
  'placeholder="Search history..."'
);

fs.writeFileSync('src/App.tsx', content);
