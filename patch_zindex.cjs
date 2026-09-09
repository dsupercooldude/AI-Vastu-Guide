const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /className=\{\`\\\$\\\{mobileMenuOpen \? 'fixed inset-0 z-50 flex' : 'hidden'\}\` md:flex md:w-80 flex-col bg-stone-900 text-stone-300 transition-all\}/,
  "className={`\\${mobileMenuOpen ? 'fixed inset-0 z-[100] flex' : 'hidden'} md:flex md:w-80 flex-col bg-stone-900 text-stone-300 transition-all`}"
);

// We should also replace the string literally just in case the regex fails
content = content.replace(
  "className={`\\${mobileMenuOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:flex md:w-80 flex-col bg-stone-900 text-stone-300 transition-all`}",
  "className={`\\${mobileMenuOpen ? 'fixed inset-0 z-[100] flex' : 'hidden'} md:flex md:w-80 flex-col bg-stone-900 text-stone-300 transition-all`}"
);

fs.writeFileSync('src/App.tsx', content);
