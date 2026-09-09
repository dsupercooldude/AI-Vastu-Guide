const fs = require('fs');
let content = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

content = content.replace(
  /<img src=\{fp.preview\} alt="Floor plan preview" className="w-32 h-32 rounded-xl border border-stone-200 object-cover" \/>/g,
  `<div className="group relative w-32 h-32 rounded-xl border border-stone-200 overflow-hidden cursor-pointer" onClick={() => setPreviewImage(fp)}>
                    <img src={fp.preview} alt="Floor plan preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  </div>`
);

// We should also handle the case where a floor plan is previewed, and we hit "Remove" or "Retake"
// Right now, `removeImage` removes from `images`, not `floorPlans`.
// If `previewImage` is a floorplan, `removeImage(previewImage.id)` won't remove it from `floorPlans`.
// Let's modify the remove and retake buttons in the modal to check both arrays.
const modalRemoveLogic = `
                onClick={() => {
                  if (images.find(img => img.id === previewImage.id)) {
                    removeImage(previewImage.id);
                  } else {
                    removeFloorPlan(previewImage.id);
                  }
                  setPreviewImage(null);
                }}
`;

content = content.replace(
  /onClick=\{\(\) => \{\n                  removeImage\(previewImage\.id\);\n                  setPreviewImage\(null\);\n                \}\}/g,
  modalRemoveLogic.trim()
);

// For retake, floorPlans usually come from upload, not camera, but we can allow camera retake.
// Wait, floorPlans are uploaded. Retaking a floor plan with camera might be weird if they uploaded it, but we can just use the camera.
// Wait, `retakeImageId` is set, and `handleCameraCapture` maps over `images`. It won't find it in `floorPlans` if it was a floorPlan.
// Let's modify `handleCameraCapture` to check both arrays.
const newHandleCameraCapture = `const handleCameraCapture = (base64: string, mimeType: string) => {
    if (retakeImageId) {
      if (images.find(img => img.id === retakeImageId)) {
        setImages(prev => prev.map(img => 
          img.id === retakeImageId 
            ? { id: retakeImageId, preview: \`data:\${mimeType};base64,\${base64}\`, base64, mimeType }
            : img
        ));
      } else {
        setFloorPlans(prev => prev.map(img => 
          img.id === retakeImageId 
            ? { id: retakeImageId, preview: \`data:\${mimeType};base64,\${base64}\`, base64, mimeType }
            : img
        ));
      }
      setRetakeImageId(null);
    } else {
      setImages(prev => [...prev, {
        id: crypto.randomUUID(),
        preview: \`data:\${mimeType};base64,\${base64}\`,
        base64,
        mimeType
      }]);
    }
  };`;

content = content.replace(
  /const handleCameraCapture = \(base64: string, mimeType: string\) => \{[\s\S]*?\}\]\);\n    \}\n  \};/g,
  newHandleCameraCapture
);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', content);
