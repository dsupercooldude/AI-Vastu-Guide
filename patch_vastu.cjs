const fs = require('fs');
let content = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

if (!content.includes('import { AIEngineUsage }')) {
  content = content.replace(
    "import { LiveCamera } from './LiveCamera';",
    "import { LiveCamera } from './LiveCamera';\nimport { AIEngineUsage } from './AIEngineUsage';\nimport { useEffect } from 'react';"
  );
}

// Add state for loading progress
content = content.replace(
  "const [isCameraOpen, setIsCameraOpen] = useState(false);",
  `const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage(prev => (prev < 2 ? prev + 1 : prev));
      }, 3500); // move to next stage every 3.5 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingStages = [
    "Processing images and mapping floor plans...",
    "Calculating spatial Vastu vectors...",
    "Generating comprehensive AI report..."
  ];`
);

// Inject AIEngineUsage before ConfidenceMeter
content = content.replace(
  "<ConfidenceMeter",
  "<AIEngineUsage />\n      <ConfidenceMeter"
);

// Update submit button to detailed progress bar
const newButton = `
          {loading ? (
            <div className="w-full bg-stone-100 rounded-xl p-4 flex flex-col gap-3 border border-stone-200">
              <div className="flex items-center justify-between text-sm font-bold text-amber-700">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                  {loadingStages[loadingStage]}
                </span>
                <span>{Math.round(((loadingStage + 1) / 3) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: \`\${((loadingStage + 1) / 3) * 100}%\` }}
                />
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={images.length === 0 && floorPlans.length === 0}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Analyze Complete House <ArrowRight className="w-5 h-5" />
            </button>
          )}
`;

content = content.replace(
  /<button[\s\S]*?disabled=\{loading \|\| \(images\.length === 0 && floorPlans\.length === 0\)\}[\s\S]*?Analyzing\.\.\.[\s\S]*?<\/button>/,
  newButton.trim()
);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', content);
