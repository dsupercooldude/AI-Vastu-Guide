const fs = require('fs');
let code = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

// add houseId to interface
code = code.replace(
  "  houseName: string;\n}",
  "  houseName: string;\n  houseId: string;\n}"
);

// add imageUtils import
code = code.replace(
  "import { ImageOverlayModal } from './ImageOverlayModal';",
  "import { ImageOverlayModal } from './ImageOverlayModal';\nimport { compressImage, saveHouseImages, getHouseImages, ImageItem } from '../utils/imageUtils';"
);

// remove the internal ImageItem interface if it exists
code = code.replace(
  /interface ImageItem \{\n  id: string;\n  preview: string;\n  base64: string;\n  mimeType: string;\n\}/g,
  ""
);

// update function signature
code = code.replace(
  "export function VastuAnalyzer({ onAnalyze, loading, confidence, onRefreshBaseline, isRefreshing, houseName }: VastuAnalyzerProps) {",
  "export function VastuAnalyzer({ onAnalyze, loading, confidence, onRefreshBaseline, isRefreshing, houseName, houseId }: VastuAnalyzerProps) {"
);

// add effect to load images when houseId changes
const loadImagesEffect = `
  useEffect(() => {
    if (houseId) {
      getHouseImages(houseId, 'photos').then(imgs => setImages(imgs));
      getHouseImages(houseId, 'floorPlans').then(fps => setFloorPlans(fps));
    } else {
      setImages([]);
      setFloorPlans([]);
    }
  }, [houseId]);

  useEffect(() => {
    if (houseId && !loading) {
      saveHouseImages(houseId, 'photos', images);
    }
  }, [images, houseId, loading]);

  useEffect(() => {
    if (houseId && !loading) {
      saveHouseImages(houseId, 'floorPlans', floorPlans);
    }
  }, [floorPlans, houseId, loading]);
`;

code = code.replace(
  "const [error, setError] = useState<string>('');",
  "const [error, setError] = useState<string>('');\n" + loadImagesEffect
);

// Replace processFile
code = code.replace(
  /const processFile = \(file: File\): Promise<ImageItem> => \{[\s\S]*?\}\);\n  \};/,
  `const processFile = compressImage;`
);

// Prevent Reset on submit
code = code.replace(
  "      setImages([]);\n      setFloorPlans([]);\n      setDescription('');\n    } catch (err: any) {",
  "      setDescription('');\n    } catch (err: any) {"
);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', code);
