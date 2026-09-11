const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "onSwitchHouse={switchHouse}",
  "onSwitchHouse={(id) => {\n                switchHouse(id);\n                setMobileMenuOpen(false);\n              }}"
);

fs.writeFileSync('src/App.tsx', code);
