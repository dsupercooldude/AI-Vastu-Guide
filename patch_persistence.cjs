const fs = require('fs');

// Patch useProfiles.ts
let useProfilesContent = fs.readFileSync('src/hooks/useProfiles.ts', 'utf8');
useProfilesContent = useProfilesContent.replace(
  /import \{ useState, useEffect \} from 'react';/,
  "import { useState, useEffect } from 'react';\nimport { get, set, del } from 'idb-keyval';"
);
useProfilesContent = useProfilesContent.replace(
  /const saved = localStorage\.getItem\('vastu_profiles'\);/g,
  "const saved = await get('vastu_profiles');"
);
useProfilesContent = useProfilesContent.replace(
  /if \(saved\) \{/,
  "if (saved && Array.isArray(saved)) {"
);
useProfilesContent = useProfilesContent.replace(
  /const parsed = JSON\.parse\(saved\);/g,
  "const parsed = saved;"
);
useProfilesContent = useProfilesContent.replace(
  /const lastActive = localStorage\.getItem\('vastu_active_profile'\);/g,
  "const lastActive = await get('vastu_active_profile');"
);
useProfilesContent = useProfilesContent.replace(
  /useEffect\(\(\) => \{([^]*?)const saved =/m,
  "useEffect(() => {\n    const load = async () => {\n      const saved ="
);
useProfilesContent = useProfilesContent.replace(
  /console\.error\('Failed to parse profiles', e\);\n      \}\n    \}\n  \}, \[\]\);/g,
  "console.error('Failed to parse profiles', e);\n      }\n    }\n    };\n    load();\n  }, []);"
);
useProfilesContent = useProfilesContent.replace(
  /localStorage\.setItem\('vastu_profiles', JSON\.stringify\((.*?)\)\);/g,
  "set('vastu_profiles', $1);"
);
useProfilesContent = useProfilesContent.replace(
  /localStorage\.setItem\('vastu_active_profile', (.*?)\);/g,
  "set('vastu_active_profile', $1);"
);
useProfilesContent = useProfilesContent.replace(
  /localStorage\.removeItem\(\`vastu_chat_\$\{id\}\`\);/g,
  "del(`vastu_chat_${id}`);"
);
useProfilesContent = useProfilesContent.replace(
  /localStorage\.removeItem\(\`vastu_houses_\$\{id\}\`\);/g,
  "del(`vastu_houses_${id}`);"
);
useProfilesContent = useProfilesContent.replace(
  /localStorage\.removeItem\('vastu_active_profile'\);/g,
  "del('vastu_active_profile');"
);

fs.writeFileSync('src/hooks/useProfiles.ts', useProfilesContent);

// Patch useHouses.ts
let useHousesContent = fs.readFileSync('src/hooks/useHouses.ts', 'utf8');
useHousesContent = useHousesContent.replace(
  /import \{ useState, useEffect \} from 'react';/,
  "import { useState, useEffect } from 'react';\nimport { get, set, del } from 'idb-keyval';"
);
useHousesContent = useHousesContent.replace(
  /useEffect\(\(\) => \{\n    if \(\!profileId\) \{/g,
  "useEffect(() => {\n    const load = async () => {\n      if (!profileId) {"
);
useHousesContent = useHousesContent.replace(
  /const saved = localStorage\.getItem\(\`vastu_houses_\$\{profileId\}\`\);/g,
  "const saved = await get(`vastu_houses_${profileId}`);"
);
useHousesContent = useHousesContent.replace(
  /if \(saved\) \{/,
  "if (saved && Array.isArray(saved)) {"
);
useHousesContent = useHousesContent.replace(
  /const parsed = JSON\.parse\(saved\);/g,
  "const parsed = saved;"
);
useHousesContent = useHousesContent.replace(
  /setHouses\(\[\]\);\n      setCurrentHouseId\(null\);\n    \}\n  \}, \[profileId\]\);/g,
  "setHouses([]);\n      setCurrentHouseId(null);\n    }\n    };\n    load();\n  }, [profileId]);"
);
useHousesContent = useHousesContent.replace(
  /localStorage\.setItem\(\`vastu_houses_\$\{profileId\}\`, JSON\.stringify\((.*?)\)\);/g,
  "set(`vastu_houses_${profileId}`, $1);"
);
useHousesContent = useHousesContent.replace(
  /localStorage\.removeItem\(\`vastu_analysis_house_\$\{id\}\`\);/g,
  "del(`vastu_analysis_house_${id}`);"
);

fs.writeFileSync('src/hooks/useHouses.ts', useHousesContent);


// Patch useEngineState.ts
let useEngineContent = fs.readFileSync('src/hooks/useEngineState.ts', 'utf8');
useEngineContent = useEngineContent.replace(
  /import \{ useState, useEffect \} from 'react';/,
  "import { useState, useEffect } from 'react';\nimport { get, set } from 'idb-keyval';"
);
useEngineContent = useEngineContent.replace(
  /useEffect\(\(\) => \{([^]*?)const savedConf = localStorage\.getItem\('vastu_confidence'\);/m,
  "useEffect(() => {\n    const load = async () => {\n      const savedConf = await get('vastu_confidence');"
);
useEngineContent = useEngineContent.replace(
  /const savedTime = localStorage\.getItem\('vastu_last_updated'\);/g,
  "const savedTime = await get('vastu_last_updated');"
);
useEngineContent = useEngineContent.replace(
  /if \(savedConf\) setConfidence\(Number\(savedConf\)\);\n    if \(savedTime\) setLastUpdated\(Number\(savedTime\)\);\n  \}, \[\]\);/g,
  "if (savedConf) setConfidence(Number(savedConf));\n      if (savedTime) setLastUpdated(Number(savedTime));\n    };\n    load();\n  }, []);"
);
useEngineContent = useEngineContent.replace(
  /localStorage\.setItem\('vastu_confidence', newConf\.toString\(\)\);/g,
  "set('vastu_confidence', newConf.toString());"
);
useEngineContent = useEngineContent.replace(
  /localStorage\.setItem\('vastu_last_updated', now\.toString\(\)\);/g,
  "set('vastu_last_updated', now.toString());"
);

fs.writeFileSync('src/hooks/useEngineState.ts', useEngineContent);

// Patch useChatHistory.ts
let useChatHistoryContent = fs.readFileSync('src/hooks/useChatHistory.ts', 'utf8');
useChatHistoryContent = useChatHistoryContent.replace(
  /import \{ useState, useEffect \} from 'react';/,
  "import { useState, useEffect } from 'react';\nimport { get, set } from 'idb-keyval';"
);
useChatHistoryContent = useChatHistoryContent.replace(
  /useEffect\(\(\) => \{\n    if \(\!profileId\) \{/g,
  "useEffect(() => {\n    const load = async () => {\n      if (!profileId) {"
);
useChatHistoryContent = useChatHistoryContent.replace(
  /const saved = localStorage\.getItem\(\`vastu_chat_\$\{profileId\}\`\);/g,
  "const saved = await get(`vastu_chat_${profileId}`);"
);
useChatHistoryContent = useChatHistoryContent.replace(
  /if \(saved\) \{/,
  "if (saved && Array.isArray(saved)) {"
);
useChatHistoryContent = useChatHistoryContent.replace(
  /const parsed = JSON\.parse\(saved\);/g,
  "const parsed = saved;"
);
useChatHistoryContent = useChatHistoryContent.replace(
  /setMessages\(\[\]\);\n    \}\n  \}, \[profileId\]\);/g,
  "setMessages([]);\n    }\n    };\n    load();\n  }, [profileId]);"
);
useChatHistoryContent = useChatHistoryContent.replace(
  /localStorage\.setItem\(\`vastu_chat_\$\{profileId\}\`, JSON\.stringify\((.*?)\)\);/g,
  "set(`vastu_chat_${profileId}`, $1);"
);

fs.writeFileSync('src/hooks/useChatHistory.ts', useChatHistoryContent);
