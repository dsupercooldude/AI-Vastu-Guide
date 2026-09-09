const fs = require('fs');
let content = fs.readFileSync('src/components/VastuAnalyzer.tsx', 'utf8');

// add Compass import
content = content.replace(
  /import \{ VastuMap \} from '\.\/VastuMap';/,
  "import { VastuMap } from './VastuMap';\nimport { Compass } from './Compass';"
);

// find Photos section and add Compass
const target = `<h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              3. Room / Angle Photos
            </h3>`;

const replacement = `<h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              3. Room / Angle Photos
            </h3>
            <div className="my-4">
              <Compass />
            </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/VastuAnalyzer.tsx', content);
