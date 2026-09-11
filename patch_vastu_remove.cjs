const fs = require('fs');
let code = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

code = code.replace(
  "import { compressImage, saveHouseImages, getHouseImages, ImageItem } from '../utils/imageUtils';",
  "import { compressImage, saveHouseImages, getHouseImages, deleteImage, ImageItem } from '../utils/imageUtils';"
);

code = code.replace(
  "  const removeImage = (id: string) => {\n    setImages(prev => prev.filter(img => img.id !== id));\n  };",
  "  const removeImage = (id: string) => {\n    setImages(prev => prev.filter(img => img.id !== id));\n    if (houseId) deleteImage(houseId, 'photos', id);\n  };"
);

code = code.replace(
  "  const removeFloorPlan = (id: string) => {\n    setFloorPlans(prev => prev.filter(img => img.id !== id));\n  };",
  "  const removeFloorPlan = (id: string) => {\n    setFloorPlans(prev => prev.filter(img => img.id !== id));\n    if (houseId) deleteImage(houseId, 'floorPlans', id);\n  };"
);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', code);
