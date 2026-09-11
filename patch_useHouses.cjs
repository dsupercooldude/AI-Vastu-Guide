const fs = require('fs');
let code = fs.readFileSync('src/hooks/useHouses.ts', 'utf8');

code = code.replace(
  "  }, [profileId, currentHouseId]);",
  "  }, [profileId]); // removed currentHouseId to prevent infinite re-renders/unsubs"
);

code = code.replace(
  "      setHouses(loaded);\n      \n      if (loaded.length > 0 && !currentHouseId) {",
  "      setHouses(loaded);\n      \n      setCurrentHouseId(prev => {\n        if (loaded.length > 0 && !prev) return loaded[0].id;\n        if (loaded.length === 0) return null;\n        return prev;\n      });"
);

// We need to also remove the original if (loaded.length > 0 && !currentHouseId) logic:
code = code.replace(
  "      if (loaded.length > 0 && !currentHouseId) {\n        setCurrentHouseId(loaded[0].id);\n      } else if (loaded.length === 0) {\n        setCurrentHouseId(null);\n      }",
  ""
);

fs.writeFileSync('src/hooks/useHouses.ts', code);
