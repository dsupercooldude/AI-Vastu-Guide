const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard div with motion.div for analyzer (with house)
content = content.replace(
  /{activeTab === 'analyzer' && currentHouseId && \(\s*<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">/,
  `{activeTab === 'analyzer' && currentHouseId && (\n              <motion.div \n                key="analyzer"\n                initial={{ opacity: 0, y: 10 }}\n                animate={{ opacity: 1, y: 0 }}\n                exit={{ opacity: 0, y: -10 }}\n                transition={{ duration: 0.2 }}\n              >`
);

// Replace standard div with motion.div for analyzer (without house)
content = content.replace(
  /{activeTab === 'analyzer' && !currentHouseId && \(\s*<div className="text-center py-12 bg-white rounded-2xl border border-stone-200">/,
  `{activeTab === 'analyzer' && !currentHouseId && (\n              <motion.div \n                key="analyzer-empty"\n                initial={{ opacity: 0, y: 10 }}\n                animate={{ opacity: 1, y: 0 }}\n                exit={{ opacity: 0, y: -10 }}\n                transition={{ duration: 0.2 }}\n                className="text-center py-12 bg-white rounded-2xl border border-stone-200"\n              >`
);

// Replace standard div with motion.div for chat
content = content.replace(
  /{activeTab === 'chat' && \(\s*<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-w-3xl mx-auto">/,
  `{activeTab === 'chat' && (\n              <motion.div \n                key="chat"\n                initial={{ opacity: 0, y: 10 }}\n                animate={{ opacity: 1, y: 0 }}\n                exit={{ opacity: 0, y: -10 }}\n                transition={{ duration: 0.2 }}\n                className="h-full max-w-3xl mx-auto"\n              >`
);

// Replace standard div with motion.div for history
content = content.replace(
  /<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">/,
  `<motion.div \n                  key="history"\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  exit={{ opacity: 0, y: -10 }}\n                  transition={{ duration: 0.2 }}\n                >`
);

// Close motion divs (this is tricky, so I'll just change the enclosing element of `activeTab` rendering blocks)
// I will wrap the entire activeTab block inside AnimatePresence
content = content.replace(
  /<div className="max-w-4xl mx-auto">\s*{activeTab === 'analyzer'/g,
  '<div className="max-w-4xl mx-auto">\n            <AnimatePresence mode="wait">\n            {activeTab === \'analyzer\''
);

// Replace the end of the history block correctly to close the motion div
content = content.replace(
  /}\(\)\)}\s*<\/div>\s*<\/main>/,
  '}(())}\n            </AnimatePresence>\n          </div>\n        </main>'
);

// Add PDF Export button for the Latest Analysis Report in the Analyzer view
content = content.replace(
  /<h3 className="text-lg font-bold text-stone-800 mb-4">Latest Analysis Report<\/h3>/,
  `<div className="flex justify-between items-center mb-4">\n                      <h3 className="text-lg font-bold text-stone-800">Latest Analysis Report</h3>\n                      <button onClick={() => exportToPDF('latest-report', \`Vastu_Report_\${currentHouse?.name}.pdf\`)} className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4"/> Export PDF</button>\n                    </div>`
);
content = content.replace(
  /<div className="prose prose-stone max-w-none">\s*<Markdown>{history\[0\]\.report}<\/Markdown>\s*<\/div>/,
  `<div id="latest-report" className="prose prose-stone max-w-none bg-white p-4 rounded-xl">\n                      <Markdown>{history[0].report}</Markdown>\n                    </div>`
);

// Add PDF Export button for History items
content = content.replace(
  /<h4 className="font-bold text-stone-800 mb-1">{item\.houseName}<\/h4>/g,
  `<h4 className="font-bold text-stone-800 mb-1">{item.houseName}</h4>\n                            <button onClick={() => exportToPDF(\`report-\${item.id}\`, \`Vastu_Report_\${item.houseName}_\${new Date(item.timestamp).getTime()}.pdf\`)} className="flex items-center justify-center gap-2 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-colors mt-1 w-fit"><Download className="w-3 h-3"/> PDF</button>`
);
content = content.replace(
  /<div className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar">/g,
  `<div id={\`report-\${item.id}\`} className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white p-2">`
);

// Now let's handle closing tags for motion.div which replaced div
content = content.replace(
  /<\/div>\s*\)\}\s*{activeTab === 'analyzer' && !currentHouseId/g,
  '</motion.div>\n            )}\n            \n            {activeTab === \'analyzer\' && !currentHouseId'
);

content = content.replace(
  /<\/div>\s*\)\}\s*{activeTab === 'chat'/g,
  '</motion.div>\n            )}\n\n            {activeTab === \'chat\''
);

content = content.replace(
  /<\/div>\s*\)\}\s*{activeTab === 'history'/g,
  '</motion.div>\n            )}\n\n            {activeTab === \'history\''
);

content = content.replace(
  /<\/div>\s*\);\s*}\)\(\)}/g,
  '</motion.div>\n              );\n            })()}'
);

fs.writeFileSync('src/App.tsx', content);
