const fs = require('fs');

let content = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

// Add LiveCamera import
content = content.replace(
  "import { ConfidenceMeter } from './ConfidenceMeter';",
  "import { ConfidenceMeter } from './ConfidenceMeter';\nimport { LiveCamera } from './LiveCamera';"
);

// Add LiveCamera state
content = content.replace(
  "const [error, setError] = useState('');",
  "const [error, setError] = useState('');\n  const [isCameraOpen, setIsCameraOpen] = useState(false);"
);

// Replace the Take photo button logic to open our custom LiveCamera
content = content.replace(
  "onClick={() => cameraInputRef.current?.click()}",
  "onClick={() => setIsCameraOpen(true)}"
);

// Add onCameraCapture handler
const captureHandler = `
  const handleCameraCapture = (base64: string, mimeType: string) => {
    setImages(prev => [...prev, {
      id: crypto.randomUUID(),
      preview: \`data:\${mimeType};base64,\${base64}\`,
      base64,
      mimeType
    }]);
  };
`;
content = content.replace(
  "const removeImage = (id: string) => {",
  captureHandler + "\n  const removeImage = (id: string) => {"
);

// Inject LiveCamera rendering
content = content.replace(
  "return (\n    <div className=\"w-full\">",
  `return (
    <div className="w-full">
      {isCameraOpen && (
        <LiveCamera 
          onCapture={handleCameraCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}`
);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', content);
