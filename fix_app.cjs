const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the JSX Fragment issue
content = content.replace(
  /{item\.houseName && <h4 className="font-bold text-stone-800 mb-1">{item\.houseName}<\/h4>\n                            <button onClick={\(\) => exportToPDF\(`report-\${item\.id}`, `Vastu_Report_\${item\.houseName}_\${new Date\(item\.timestamp\)\.getTime\(\)}\.pdf`\)} className="flex items-center justify-center gap-2 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-colors mt-1 w-fit"><Download className="w-3 h-3"\/> PDF<\/button>}/g,
  `{item.houseName && (\n                              <>\n                                <h4 className="font-bold text-stone-800 mb-1">{item.houseName}</h4>\n                                <button onClick={() => exportToPDF(\`report-\${item.id}\`, \`Vastu_Report_\${item.houseName}_\${new Date(item.timestamp).getTime()}.pdf\`)} className="flex items-center justify-center gap-2 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-colors mt-1 w-fit"><Download className="w-3 h-3"/> PDF</button>\n                              </>\n                            )}`
);

// Fix the AnimatePresence closing tag
content = content.replace(
  /}\)\(\)}\n          <\/div>\n        <\/main>/,
  `})()}\n            </AnimatePresence>\n          </div>\n        </main>`
);

fs.writeFileSync('src/App.tsx', content);
