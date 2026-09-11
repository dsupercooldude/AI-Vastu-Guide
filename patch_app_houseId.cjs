const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "houseName={currentHouse?.name || ''}",
  "houseName={currentHouse?.name || ''}\n                  houseId={currentHouseId || ''}"
);

fs.writeFileSync('src/App.tsx', code);
