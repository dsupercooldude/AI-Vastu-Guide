const fs = require('fs');
let code = fs.readFileSync('src/hooks/useHouses.ts', 'utf8');

code = code.replace(
  "      });\n        setCurrentHouseId(loaded[0].id);\n      } else if (loaded.length === 0) {\n        setCurrentHouseId(null);\n      }",
  "      });"
);

fs.writeFileSync('src/hooks/useHouses.ts', code);
