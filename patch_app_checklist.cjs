const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  /import \{ useEngineState \} from '\.\/hooks\/useEngineState';/,
  "import { useEngineState } from './hooks/useEngineState';\nimport { useChecklist } from './hooks/useChecklist';"
);

// Add hook
content = content.replace(
  /const \[previewImageSrc, setPreviewImageSrc\] = useState<string \| null>\(null\);/,
  "const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);\n  const { checkedItems, toggleCheck, setVerified } = useChecklist(currentHouseId);"
);

// Update handleAnalyzeWrapper
content = content.replace(
  /const result = await analyzeHouse\(images, floorPlans, desc, houseName\);\n    setConfidence\(prev => Math\.min\(99, prev \+ 1\)\);\n    return result;/,
  "const result = await analyzeHouse(images, floorPlans, desc, houseName);\n    setConfidence(prev => Math.min(99, prev + 1));\n    if (result && result.verifiedChecklistItems) {\n      setVerified(result.verifiedChecklistItems);\n    }\n    return result;"
);

// Update VastuChecklist component
content = content.replace(
  /<VastuChecklist houseId=\{currentHouseId\} \/>/,
  "<VastuChecklist checkedItems={checkedItems} onToggle={toggleCheck} />"
);

fs.writeFileSync('src/App.tsx', content);
