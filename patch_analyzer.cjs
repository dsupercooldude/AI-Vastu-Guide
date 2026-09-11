const fs = require('fs');
let code = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

code = code.replace(
  /<button\s+type="button"\s+onClick=\{\(\) => setIsCameraOpen\(true\)\}\s+className="w-32 h-\[3\.8rem\] border border-stone-300 rounded-xl flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-50 hover:border-amber-400 transition-colors text-sm font-medium"\s*>\s*<Camera className="w-4 h-4" \/> Take\s*<\/button>/g,
  `<button 
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-32 h-[3.8rem] border border-amber-300 bg-amber-50 rounded-xl flex items-center justify-center gap-2 text-amber-700 hover:bg-amber-100 hover:border-amber-400 transition-colors text-sm font-bold shadow-sm"
                >
                  <Camera className="w-4 h-4" /> AR Scanner
                </button>`
);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', code);
